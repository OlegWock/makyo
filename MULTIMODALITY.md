# Multimodality support

## Vision

Supported formats (Anthropic and OpenAI): JPEG, PNG, GIF, and WebP

OpenAI supports vision only on GPT-4o and GPT-4 Turbo. There is two modes of resolution: low and high (and auto between the two). High should work better, but it's also a lot more pricey. So we might want to let user select mode???

> For low res mode, we expect a 512px x 512px image. For high res mode, the short side of the image should be less than 768px and the long side should be less than 2,000px.

---

After vision, it might make sense to support audio input, audio output, image generation
