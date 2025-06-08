import { StyleSheet } from 'react-native';

export const createAuthStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: themeColors.authbackground,
  },
  logo: {
    width: 300,
    height: 200,
    alignSelf: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 80,
    textAlign: 'center',
    color: themeColors.tint,
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.tint,
    padding: 15,
    fontSize: 16,
    borderRadius: 6,
    marginBottom: 12,
    color: themeColors.tint,
    backgroundColor: themeColors.background,
  },
  button: {
    backgroundColor: themeColors.tint,
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: themeColors.tint,
    textAlign: 'center',
    marginTop: 20,
  },
});
