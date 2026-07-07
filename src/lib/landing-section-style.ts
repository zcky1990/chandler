import type { CSSProperties } from 'vue'

export function landingSectionStyle(
  bgImage: string | null | undefined,
  bgColor: string,
): CSSProperties {
  const image = bgImage?.trim()
  if (image) {
    return {
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: bgColor,
    }
  }
  return { backgroundColor: bgColor }
}
