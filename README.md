<div align="center">
  <h1>💰 EveryExpense</h1>
  <p>A comprehensive and beautiful personal finance tracker built with React Native and Expo.</p>
</div>

---

## ✨ Features

- **Intuitive Dashboard:** Get a quick overview of your balances, recent transactions, and spending trends.
- **Expense & Income Tracking:** Easily add, edit, and categorize your transactions.
- **Visual Insights:** Interactive charts and graphs powered by Victory Native.
- **Local First & Offline Ready:** Your data stays on your device using SQLite, syncing only when you want.
- **Multilingual Support:** Seamlessly switch between languages with built-in i18n support.
- **Accessible & Responsive:** Adapts to user text sizing preferences with cross-platform (iOS & Android) accessibility best practices.
- **Modern UI:** Built with NativeWind (Tailwind CSS) for a sleek, responsive, and beautiful interface.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (Expo Router)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **State Management & Forms:** React Hook Form, Zod
- **Database:** `expo-sqlite`
- **Charts:** `victory-native` & `@shopify/react-native-skia`
- **Localization:** `i18next` & `react-i18next`

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Git](https://git-scm.com/)
- Expo Go app on your physical device OR an iOS Simulator / Android Emulator.

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd EveryExpense/frontend
   ```

2. **Install dependencies:**
   This project uses `bun` (based on `bun.lock`), but `npm` works just fine.
   ```bash
   # If using npm
   npm install

   # If using bun
   bun install
   ```

3. **Start the Expo Development Server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run the App:**
   Once the development server is running, you can open the app:
   - **On a physical device:** Scan the QR code displayed in the terminal using the Expo Go app (Android) or the native Camera app (iOS).
   - **On an iOS Simulator:** Press `i` in the terminal.
   - **On an Android Emulator:** Press `a` in the terminal.
   - **On the Web:** Press `w` in the terminal.

---

## 📜 Available Scripts

- `npm start` - Starts the Expo development server.
- `npm run android` - Runs the app on an Android emulator/device.
- `npm run ios` - Runs the app on an iOS simulator/device.
- `npm run web` - Starts the app in a web browser.
- `npm run lint` - Lints the codebase using ESLint.
- `npm run test` - Runs unit tests using Jest.
- `npm run reset-project` - Resets the Expo boilerplate routing (if needed).

---

## 📂 Project Structure

```text
frontend/
├── app/                  # Expo Router file-based navigation (Screens)
├── components/           # Reusable UI components
│   └── ui/               # Base UI elements (Text, Card, Input, etc.)
├── constants/            # Global constants (Colors, Themes, Currencies)
├── context/              # React Context providers (State Management)
├── hooks/                # Custom React hooks
├── locales/              # i18n translation files
├── utils/                # Helper functions (Normalization, Sync, APIs)
├── assets/               # Static assets (Images, Fonts)
└── package.json          # Project metadata and dependencies
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

<div align="center">
  <sub>Built with ❤️ for a better financial future.</sub>
</div>
