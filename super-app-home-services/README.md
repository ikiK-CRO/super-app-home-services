# Super App for Home Services

A comprehensive mobile application for home services in Croatia. This super app connects users with various home service providers like cleaning, plumbing, electrical work, and more.

## Project Structure

The project is divided into two main parts:

- `mobile`: React Native mobile app (Expo)
- `server`: Node.js backend API (coming soon)

## Mobile App

### Features

- User authentication (login, register, password recovery)
- Browse service categories
- Search for services
- View service details
- Book services
- Manage bookings
- User profiles
- Payment integration
- Multilingual support (Croatian and English)

### Tech Stack

- React Native with Expo
- TypeScript
- React Navigation for routing
- React Native Paper for UI components
- i18n-js for localization
- Axios for API requests
- AsyncStorage for local storage

### Getting Started

1. Clone this repository
2. Install dependencies:

```bash
cd super-app-home-services/mobile
npm install
```

3. Start the development server:

```bash
npm start
```

4. Use Expo Go app on your phone to scan the QR code or run on an emulator.

## Development

### Mobile Development

The mobile app is built with React Native and Expo, using TypeScript for type safety. The app follows a component-based architecture with the following structure:

- `src/screens`: Screen components
- `src/components`: Reusable UI components
- `src/navigation`: Navigation structure
- `src/contexts`: React contexts (auth, etc.)
- `src/i18n`: Internationalization setup
- `src/services`: API services and utilities

### Translations

The app supports both Croatian and English languages. Translations are managed in:

- `src/i18n/translations/hr.ts` (Croatian)
- `src/i18n/translations/en.ts` (English)

## License

This project is proprietary and confidential.

## Contact

For any questions or inquiries, please contact our team at [contact@superapp-homeservices.com](mailto:contact@superapp-homeservices.com). 