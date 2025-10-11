# Running LLMs Locally with vLLM

I've been curious about running Large Language Models (LLMs) - think ChatGPT-style AI models - on my own hardware instead of relying on cloud services. After picking up two second-hand RTX 3090 graphics cards from CEX (£575 each), I decided to dive in and see what's possible with 48GB of VRAM at my disposal.

## What Are Local LLMs?

When you use ChatGPT or Claude, your prompts get sent to massive data centers where the AI models run on enterprise-grade hardware. Running LLMs locally means hosting these AI models on your own computer. The trade-off? You need serious GPU power, but you get complete privacy, no rate limits, and no monthly subscriptions.

## The Hardware Setup

I'm running dual RTX 3090s, each with 24GB of VRAM (Video RAM - the memory on your graphics card). VRAM is crucial for LLMs because the entire model needs to fit in memory during inference (when the model generates responses). With 48GB total, I can run models that would be impossible on a single consumer GPU.

Getting NVIDIA drivers and CUDA (NVIDIA's parallel computing platform) working on Ubuntu 24.04 was surprisingly painless - a pleasant change from the driver hell of years past. The real learning curve was understanding how different factors affect memory usage:

- **Model size**: Bigger models (more parameters) = better quality but more VRAM needed
- **Quantization**: Reducing precision from 16-bit to 4-bit cuts memory usage dramatically
- **Context length**: How much conversation history the model can remember

## Enter vLLM

vLLM is an open-source inference engine designed for high-throughput LLM serving. Its killer feature for me was tensor parallelism - the ability to split a model across multiple GPUs. Without this, my second 3090 would just be sitting idle.

With tensor parallelism, the model's layers get distributed across both GPUs, and they work in parallel to generate responses. This is essential for running larger models that wouldn't fit on a single GPU.

## Building a Wrapper

Vanilla vLLM is powerful but not exactly user-friendly. You need to remember various command-line flags, model paths, and optimization settings. So I built a Python wrapper that makes the whole experience more accessible.

### Key Features

The wrapper includes several quality-of-life improvements:

**Interactive Menu System**
Instead of typing long commands, you get a menu that lists available models and lets you pick one. It automatically detects how many GPUs you have and configures tensor parallelism accordingly.

**YAML Configuration Profiles**
Each model gets its own configuration file that stores optimal settings:

```yaml
name: qwen3-30b-a3b-gptq-int4
description: Qwen3 30B model with 4-bit quantization
model: Qwen/Qwen3-30B-A3B-GPTQ-Int4
quantization: gptq
tensor_parallel_size: auto  # Uses both GPUs automatically
max_model_len: 24576  # Maximum context length
gpu_memory_utilization: 0.9  # Use 90% of available VRAM
```

**VRAM Estimation Tool**
Before downloading a 15GB model only to find it won't run, the estimator predicts memory requirements. It calculates:

- Base model size
- KV cache (memory for conversation history)
- Activation memory (working memory during generation)

This saves hours of trial and error.

**Pre-download Capability**
Sometimes vLLM's memory checks are too conservative. The pre-download tool lets you grab models anyway and test if they'll run with your specific configuration.

## Real-World Performance

With quantized models like Qwen3 30B (30 billion parameters compressed to 4-bit precision), I'm seeing 70-80 tokens per second. The responses feel instant for coding tasks.

Qwen3 30B has been my go-to model. It's large enough to handle complex reasoning but quantized efficiently enough to fit comfortably in my VRAM with room for decent context length.

## My Use Case: "Vibe Coding"

I do a lot of rapid prototyping with Node.js web apps using heavy AI assistance. My usual workflow involves VSCode with Claude Code or Roo code extension, where I describe what I want and the AI helps implement it right there in the editor.

I wanted to see if local models could replace this workflow. The results have been educational:

**The Good:**

- Complete privacy - code never leaves my machine
- No rate limits or "you've sent too many messages" warnings
- Can run specialized coding models

**The Reality Check:**

- More error correction needed compared to Claude or Gemini
- Takes longer to get production-ready code
- Cloud services can run massive models (100B+ parameters) that would need $50k+ of hardware locally

The fundamental limitation is scale. OpenAI and Anthropic run models on clusters with thousands of GPUs. My dual 3090 setup is impressive for a home lab but can't compete with that raw power.

## Beyond Coding

Local LLMs aren't just for coding. I've been experimenting with:

- **Image generation** - Stable Diffusion models for creating artwork
- **Document proofreading** - Privacy-first editing assistance
- **General chat** - Having a knowledgeable assistant without internet dependency
- **Specialized tasks** - Running fine-tuned models for specific domains

Many of these use cases work great with smaller models that don't need massive VRAM.

## Lessons Learned

This project taught me several things:

1. **Hardware requirements are real** - You need modern GPUs with substantial VRAM. My old GTX 1080 wouldn't cut it.

2. **Quantization is magic** - 4-bit models perform surprisingly well while using 75% less memory than full precision.

3. **Context matters** - A great model with tiny context length is frustrating for real work.

4. **Open source is thriving** - New models appear weekly, each pushing what's possible locally.

5. **It's not all or nothing** - I use local models for experimentation and privacy-sensitive work, but still reach for cloud services when I need maximum capability.

## Should You Try This?

If you have:

- A modern GPU with at least 12GB VRAM (24GB+ is better)
- Fast storage (models are 10-50GB each)
- Curiosity about AI infrastructure
- Use cases where privacy matters

Then absolutely give it a shot. The open-source model ecosystem is incredible right now, with models for every use case imaginable.

## Getting Started

If you want to try this yourself, check out my git repository [vLLM wrapper](https://github.com/aloonj/vllm-nvidia). The setup script handles most of the complexity:

```bash
git clone https://github.com/aloonj/vllm-nvidia
cd vllm-nvidia
./setup.sh
source activate_vllm.sh
python api_server.py
```

The interactive menu will guide you through selecting and running your first model. Start with smaller quantized models to get a feel for what your hardware can handle.

## Final Thoughts

Running LLMs locally has been an incredible learning experience. While it can't fully replace cloud services for heavy-duty work, having powerful AI models running entirely on your own hardware feels like science fiction made real. The technology is improving rapidly - models that needed server farms two years ago now run on consumer GPUs.

Whether you're interested in privacy, learning about AI infrastructure, or just like tinkering with cutting-edge tech, local LLMs are worth exploring. Just be prepared for your electricity bill to notice those dual GPUs spinning up.
