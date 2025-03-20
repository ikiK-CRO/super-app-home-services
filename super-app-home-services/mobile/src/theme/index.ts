import { MD3LightTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Modern colors palette with Croatian influence
const colors = {
  primary: '#0057B8', // Croatian blue
  primaryDark: '#004494',
  primaryLight: '#3B7CD1',
  secondary: '#E31B23', // Croatian red
  secondaryDark: '#B81219',
  secondaryLight: '#E84850',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FFC107',
  info: '#2196F3',
  text: '#1E2328',
  textSecondary: '#505A64',
  disabled: '#C2C7CE',
  placeholder: '#969FA8',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  border: '#E1E5EA',
  card: '#FFFFFF',
  shadow: '#121212',
  notification: '#E31B23', // Croatian red
  accent: '#FFCC00', // Croatian gold/yellow
};

// Create Paper theme
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: colors.surface,
    onSecondary: colors.surface,
    onBackground: colors.text,
    onSurface: colors.text,
    onError: colors.surface,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: colors.backdrop,
    notification: colors.notification,
  },
  roundness: 8,
};

// Create Navigation theme
const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.notification,
  },
};

// Common styles
const commonStyles = {
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
  },
  buttonSecondary: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  inputField: {
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
};

export { paperTheme, navigationTheme, colors, commonStyles }; 