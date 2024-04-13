import confetti from "canvas-confetti"

function randomInRange(min, max) {
  return Math.random() * (max - min) + min
}

function fireConfetti() {
  confetti({
    angle: randomInRange(45, 135),
    spread: 180,
    particleCount: 150,
    origin: { y: 0.5 },
  })
}

export { fireConfetti }
