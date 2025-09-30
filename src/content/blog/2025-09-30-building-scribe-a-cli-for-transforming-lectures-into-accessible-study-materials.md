---
title: "Building Scribe: A CLI for Transforming Lectures into Accessible Study Materials"
excerpt: "How I built a command-line tool that converts educational videos into cleaned, organized, and culturally-contextualized transcripts using FFmpeg, Whisper, and Gemini's thinking models."
tags: ["C#", ".NET", "AI", "Education", "CLI"]
state: draft
---

As a graduate student taking doctoral-level courses, I found myself spending hours rewatching lecture recordings, trying to catch technical terms I missed or struggling with cultural references that weren't immediately clear to me as a non-native English speaker. I needed a way to transform these video lectures into study materials that preserved every detail while making the content more accessible.

That's why I built **Scribe.Cli** - a command-line tool that takes an educational video and produces a refined, organized, and contextualized transcript in markdown format, complete with PDF export.

## The Pipeline

Scribe implements a four-stage pipeline:

1. **Audio Extraction** - Extract optimized audio from video
2. **Transcription** - Convert speech to text using Whisper
3. **Refinement** - Fix errors and add structure
4. **Simplification** - Add context and clarify cultural references

Let me walk through each stage.

## Stage 1: Audio Extraction with FFmpeg

The first challenge was extracting audio from video files in a format optimized for transcription. I used FFMpegCore to handle this:

```csharp
await FFMpegArguments.FromFileInput(path)
    .OutputToPipe(new StreamPipeSink(outputStream),
        options => options.DisableChannel(Channel.Video)
            .WithAudioSamplingRate(48000)
            .WithAudioFilters(af => af.HighPass(70))
            .WithAudioCodec("libopus")
            .WithAudioBitrate(32)
            .ForceFormat("ogg")
            .WithCustomArgument("-ac 1")
            .WithCustomArgument("-vbr on")
            .WithCustomArgument("-compression_level 0")
            .WithCustomArgument("-application voip")
            .WithCustomArgument("-frame_duration 60")
            .WithCustomArgument("-dtx 0"))
    .ProcessAsynchronously();
```

The key optimizations here:

- **48kHz sampling rate** - High enough for speech clarity
- **70Hz high-pass filter** - Removes low-frequency rumble
- **Opus codec with VBR** - Variable bitrate encoding optimized for voice
- **Mono audio** (`-ac 1`) - Speech doesn't need stereo
- **VOIP application mode** - Opus profile tuned for speech
- **32kbps bitrate** - Keeps file size manageable while maintaining quality

This configuration produces compact audio files optimized specifically for speech transcription rather than music or general audio.

## Stage 2: Transcription with Whisper

For transcription, I used Groq's Whisper Large V3 Turbo API. The audio stream is sent as a multipart form request:

```csharp
using var multipartFormDataContent = new MultipartFormDataContent
{
    { new StreamContent(stream), "file", "audio.ogg" },
    { new StringContent(model), "model" },
    { new StringContent("text"), "response_format" },
    { new StringContent("en"), "language" },
};

var response = await httpClient.PostAsync("audio/transcriptions",
    multipartFormDataContent,
    cancellationToken);
```

Whisper produces remarkably accurate transcriptions, but it's not perfect. Technical terms like "2000 hertz" might come out as "2000 hearts", and speaker disfluencies are transcribed verbatim.

## Stage 3: Refinement with Gemini 2.5 Pro

This is where things get interesting. I use Google's Gemini 2.5 Pro with extended thinking to simultaneously correct transcription errors AND add structural organization.

The prompt instructs the model to:

1. **Fix transcription errors** - Correct mishearings based on context
2. **Improve grammar and punctuation** - Add proper sentence structure
3. **Remove verbal fillers** - Eliminate "um", "uh", "you know"
4. **Preserve ALL substantive content** - Critical: no summarization
5. **Add section headings** - Create navigable structure with `##` and `###`

Here's the API call using Gemini's thinking mode:

```csharp
var request = GeminiApiRequest.CreateBuilder()
    .WithSystemPrompt(Prompts.TranscriptRefinement)
    .WithUserPrompt(rawTranscript)
    .WithThinkingBudget(32768)
    .Build();
```

The `WithThinkingBudget(32768)` is crucial - it allocates 32K tokens for the model's internal reasoning process. Extended thinking models work by first reasoning through the task internally before generating output, which dramatically improves the quality of complex tasks like transcript correction.

## Stage 4: Simplification for Non-Native Speakers

The final stage addresses a personal pain point: making academic content accessible to non-native English speakers unfamiliar with American cultural context.

The simplification prompt instructs Gemini to:

1. **Simplify language** - Replace complex sentences and vocabulary
2. **Explain idioms** - Clarify colloquialisms and cultural references
3. **Add context asides** - Insert contextual explanations using formatted blockquotes
4. **Define technical terms** - Explain jargon immediately after use
5. **Preserve complete information** - Again, no summarization

Context asides are added in this format:

```markdown
> **CONTEXT: 🌍 Culture** - For American cultural references

> **CONTEXT: 📚 Definition** - For technical terms

> **CONTEXT: 🏛️ Institution** - For American educational systems

> **CONTEXT: 📰 Current Events** - For news or historical events

> **CONTEXT: 💰 Economics** - For financial concepts

> **CONTEXT: 🎓 Academic** - For academic procedures
```

Here's a real example from the prompt showing the transformation:

**Original:**
> During the mid-1920s, quantum mechanics underwent a revolutionary transformation from the "old quantum theory" of Bohr-Sommerfeld quantization rules...

**Simplified:**
> During the middle years of the 1920s, quantum mechanics went through a revolutionary change. Before this time, physicists used something called the "old quantum theory." This theory used the Bohr-Sommerfeld quantization rules.
>
> > 📚 **CONTEXT - Definition:** Quantization means that certain properties in nature can only have specific values, not any value. Think of it like stairs - you can only stand on specific steps, not between them.

The simplified version is more verbose, but dramatically more accessible.

## PDF Generation

After processing, the markdown transcript is converted to PDF using Pandoc with WeasyPrint:

```csharp
var mdPath = Path.ChangeExtension(path.Replace("Video", "Notes"), ".md");
File.WriteAllText(mdPath, simplifiedTranscription);

await Process.Start("pandoc",
    $"\"{mdPath}\" -o \"{Path.ChangeExtension(path, ".pdf")}\" --pdf-engine=weasyprint -c margins.css")!
    .WaitForExitAsync(cancellationToken);
```

This produces a clean PDF with proper formatting, ready for printing or annotation.

## Architecture Decisions

### Why System.CommandLine?

I used `System.CommandLine` (v2.0.0-rc.1) for CLI argument parsing. While still in RC, it provides a clean, type-safe API:

```csharp
var argument = new Argument<string>("path")
{
    Description = "Path to the video file to be processed."
};

var root = new RootCommand("Scribe CLI") { argument };

root.SetAction(async (parseResult, cancellationToken) =>
{
    var path = parseResult.GetValue(argument)!;
    // Process file...
});
```

### Why Dependency Injection for a CLI?

Using Microsoft.Extensions.Hosting might seem like overkill for a CLI tool, but it provides several benefits:

```csharp
using var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddSingleton<ITranscriptionService, TranscriptionService>()
                .AddHttpClient<TranscriptionService>(client =>
                {
                    client.Timeout = TimeSpan.FromMinutes(15);
                });
    })
    .Build();
```

This gives us:

- Configuration management via `appsettings.json`
- Structured logging with `ILogger<T>`
- Properly configured `HttpClient` instances with appropriate timeouts
- Easy testability

### API Configuration

The tool uses three different AI services:

```json
{
  "Tasks": {
    "Transcribe": {
      "BaseUrl": "https://api.groq.com/openai/v1/",
      "Model": "whisper-large-v3-turbo"
    },
    "Refine": {
      "BaseUrl": "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent",
      "Model": "gemini-2.5-pro"
    },
    "Simplify": {
      "Model": "gemini-2.5-pro"
    }
  }
}
```

The `${model}` placeholder in the base URL is replaced at runtime, allowing flexible model selection without hardcoding URLs.

## Progress Tracking

One quality-of-life feature I added was progress tracking during audio extraction. FFMpegCore provides progress callbacks that I enhanced with custom logger extensions:

```csharp
.NotifyOnProgress((percentage) =>
{
    _logger.WithProgressTracking()
           .LogInformation("Extracting audio... {percentage:F1}%", percentage);
}, duration)
```

The `WithProgressTracking()` extension method prevents log spam by writing progress updates on the same line in the terminal.

## Results

The tool successfully transforms hour-long lecture videos into:

- **Clean transcripts** - Grammatically correct with proper punctuation
- **Organized structure** - Section headings for easy navigation
- **Cultural context** - Explanations of idioms and cultural references
- **Simplified language** - Accessible to non-native speakers
- **Complete preservation** - No information loss from original lecture

Processing times:

- Audio extraction: ~1 minute for 1-hour video
- Transcription: ~2-3 minutes
- Refinement: ~3-4 minutes (with extended thinking)
- Simplification: ~4-5 minutes (with extended thinking)
- Total: ~10-13 minutes per hour of lecture

## Future Improvements

There are two unimplemented features in the interface:

```csharp
Task<string> GenerateQuizAsync(string simplifiedTranscript, CancellationToken cancellationToken);
Task<string> GenerateAnkiDeckAsync(string quiz, CancellationToken cancellationToken);
```

I'd like to add:

- Quiz generation from transcript content
- Anki flashcard deck creation for spaced repetition
- Support for batch processing multiple videos
- Better error recovery for API failures

## Conclusion

Scribe.Cli demonstrates how modern AI models can be composed into useful tools for education. By combining Whisper's transcription capabilities with Gemini's extended thinking for complex text processing, we can transform inaccessible lecture videos into study materials that preserve every detail while being far more approachable.

The tool is particularly valuable for non-native English speakers, students with auditory processing challenges, or anyone who prefers reading to watching hours of video lectures. It's not a replacement for attending lectures, but it's an incredibly useful supplement for review and study.

The complete source code is available at [github.com/adyavanapalli/Scribe.Cli](https://github.com/adyavanapalli/Scribe.Cli).
