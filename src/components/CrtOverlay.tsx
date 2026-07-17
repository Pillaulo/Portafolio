/** Full-screen CRT post look: scanlines, vignette, RGB fringe, flicker */
export function CrtOverlay() {
  return (
    <div className="crt-fx" aria-hidden>
      <div className="crt-fx__scanlines" />
      <div className="crt-fx__vignette" />
      <div className="crt-fx__aberration" />
      <div className="crt-fx__flicker" />
      <div className="crt-fx__bezel" />
    </div>
  )
}
