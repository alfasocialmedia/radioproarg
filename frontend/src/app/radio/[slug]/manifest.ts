import { MetadataRoute } from 'next';

export default async function manifest(
  props: { params: Promise<{ slug: string }> }
): Promise<MetadataRoute.Manifest> {
  const { slug } = await props.params;
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  let name = `Emisora ${slug}`;
  let short_name = slug;
  let theme_color = '#3b82f6';
  let description = 'Escuchá la mejor radio online, directo en tu celular.';
  let iconUrl = '/globe.svg';
  const background_color = '#020617';

  try {
    const res = await fetch(`${BACKEND}/api/v1/radios/config`, {
      headers: { 'x-tenant': slug },
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      name = data.metaTitulo || data.nombre || name;
      short_name = (data.nombre || short_name).substring(0, 12);
      description = data.metaDescripcion || description;
      theme_color = data.colorPrimario || theme_color;
      iconUrl = data.faviconUrl || data.logoUrl || iconUrl;
    }
  } catch (error) {
    console.error("Manifest generation error:", error);
  }

  return {
    name,
    short_name,
    description,
    start_url: `/radio/${slug}`,
    display: 'standalone',
    background_color,
    theme_color,
    orientation: 'portrait-primary',
    icons: [
      {
        src: iconUrl,
        sizes: 'any',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: iconUrl,
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: iconUrl,
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}
