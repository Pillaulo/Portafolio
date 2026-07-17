/** Full-screen CRT post look: heavy scanlines, vignette, RGB fringe, phosphor, roll */
export function CrtOverlay() {
  return (
    <div className="crt-fx" aria-hidden>
      <div className="crt-fx__scanlines" />
      <div className="crt-fx__scanlines crt-fx__scanlines--fine" />
      <div className="crt-fx__phosphor" />
      <div className="crt-fx__roll" />
      <div className="crt-fx__vignette" />
      <div className="crt-fx__aberration" />
      <div className="crt-fx__flicker" />
      <div className="crt-fx__bezel" />
    </div>
  )
}
