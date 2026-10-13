export const motionTokens = {
  transition: {
    quick: { duration: 0.15, ease: "easeOut" },
    standard: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] },
    spring: { type: "spring", stiffness: 350, damping: 25 },
    bounce: { type: "spring", stiffness: 450, damping: 15 },
  },
  scale: {
    hover: 1.25,
    tap: 0.95,
  },
};
