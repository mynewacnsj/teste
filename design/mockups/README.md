# Mockups das imagens dos cards de serviços

Cada imagem de card é uma página HTML de 1080×720 renderizada no Chrome e salva em WebP.
Para mudar textos, números, @, cidade ou fotos, edite o HTML e renderize de novo.

| Arquivo | Imagem gerada |
|---|---|
| `meta-ads.html` | `media/servicios/meta-ads.webp` — anúncio patrocinado no Instagram + desempenho da campanha, segmentação por CEP/raio e lead calificado |
| `social-media.html` | `media/servicios/social-media.webp` — perfil de Instagram de remodeladora, post Antes/Después e DM |
| `estimates.html` | `media/servicios/estimates.webp` — estimate com marca, itens, total e assinatura + conversa de aprovação |
| `seo-ia.html` | `media/servicios/seo-ia.webp` — assistente de IA recomendando a empresa como nº 1, com fontes e mapa |

Fotos usadas ficam em `img/` (Unsplash, licença livre, e recortes do hero do site); a textura vem de `../../grain.png`.

## Renderizar

```bash
node scripts/render-mockup.js design/mockups/estimates.html /tmp/estimates@2x.png
python3 -c "from PIL import Image; Image.open('/tmp/estimates@2x.png').convert('RGB').resize((1080,720), Image.LANCZOS).save('media/servicios/estimates.webp', 'WEBP', quality=80, method=6)"
```

Os dados (Tu Empresa Remodeling, María González, Carlos Méndez, valores, métricas, reseñas) são fictícios.
