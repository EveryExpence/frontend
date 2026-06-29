# react-native
- When using AnimatedBackground/Ken Burns background, parent containers (SafeAreaView, ScrollView) must have flex-1 and bg-theme-background to prevent animated background from visually bleeding through. Confidence: 0.70
- For sub-page navigation (accounts, payments, categories): screens must fully disappear before the next screen is shown — no overlapping slide animations during transitions. Confidence: 0.80

