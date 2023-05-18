// Imports
import { StyleSheet, View, SafeAreaView, Image, StatusBar } from 'react-native';
import React, { useState } from 'react';
import { Appbar, Button, Text } from 'react-native-paper';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Number of cell in the input field
const CELL_COUNT = 5;
const CodeVerificationScreen = () => {
  const navigation = useNavigation();
  const [showLoading, setShowloading] = useState();
  const [error, setError] = useState(false);
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  // Helper Functions
  const handleNext = async () => {
    setShowloading(true);
    const codeExist = await handleCodeVerification(value);
    if (codeExist) {
      setShowloading(false);
      setError(false);
      navigation.navigate('SignUpScreen', { code: value });
    } else {
      setShowloading(false);
      setError(true);
      return;
    }
  };
  const handleCodeVerification = async (code) => {
    const familyCodesRef = doc(db, 'familyCodes', code);
    const docSnap = await getDoc(familyCodesRef);
    return docSnap.exists();
  };
  return (
    <>
      {/* Provides a safe area for content rendering, ensuring it is visible and not obstructed by device-specific elements like notches or status bars. */}
      <SafeAreaView style={styles.container}>
        {/* The component renders a StatusBar component to set the status bar appearance. */}
        <StatusBar
          backgroundColor="#FF4C38"
          barStyle="light-content"
          translucent
        />
        {/* Wrap the content with KeyboardAwareScrollView to enable scrolling when the keyboard is open */}
        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Component to display the header */}
          <Appbar.Header style={{ backgroundColor: '#FFFFFF' }}>
            <Appbar.BackAction
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(230, 230, 230, 0.56)',
              }}
              onPress={() => {
                navigation.pop();
              }}
            />
          </Appbar.Header>
          <View
            style={{
              paddingHorizontal: '8%',
              flex: 1,
            }}
          >
            {/* Display title with detail text and img background */}
            <View
              style={{
                width: '100%',
                height: 200,
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Image
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  left: -20,
                }}
                source={require('../assets/AppAssets/registration_bg.png')}
              />
              <Text variant="displayMedium" style={{ color: '#FF4C38' }}>
                Enter Code
              </Text>
              <Text variant="bodyLarge" style={{ color: '#151940' }}>
                Ask your Family Provider for the Family Code generated on their
                account screen.
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                height: 80,
                justifyContent: 'center',
              }}
            >
              {/* Display error message for code */}
              {error && (
                <Text style={{ color: '#FF4C38' }}>
                  Invalid verification code.
                </Text>
              )}
              {/* Input field for the code */}
              <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                  <Text
                    variant="displayLarge"
                    key={index}
                    style={[styles.cell, isFocused && styles.focusCell]}
                    onLayout={getCellOnLayoutHandler(index)}
                  >
                    {symbol ||
                      (isFocused ? (
                        <Cursor
                          cursorSymbol={
                            <Text
                              variant="displayMedium"
                              style={{ lineHeight: 58, fontSize: 30 }}
                            >
                              |
                            </Text>
                          }
                        />
                      ) : null)}
                  </Text>
                )}
              />
            </View>

            {/* Next button */}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Button
                mode="contained"
                loading={showLoading}
                disabled={value.length !== 5 ? true : false}
                style={{
                  backgroundColor: '#FF4C38',
                  marginVertical: 10,
                  borderRadius: 5,
                }}
                contentStyle={{ padding: 3 }}
                onPress={() => {
                  handleNext();
                }}
              >
                Next
              </Button>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
};

export default CodeVerificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { textAlign: 'center', fontSize: 30 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: 50,
    height: 50,
    lineHeight: 60,
    fontSize: 30,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: '#F5F6FA',
    backgroundColor: '#F5F6FA',
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#FF4C38',
  },
});
