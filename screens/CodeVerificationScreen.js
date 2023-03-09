import { StyleSheet, View, SafeAreaView, Image } from 'react-native';
import React, { useState } from 'react';
import { Appbar, Button, Text } from 'react-native-paper';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useNavigation } from '@react-navigation/native';

const CELL_COUNT = 5;
const CodeVerificationScreen = () => {
  const navigation = useNavigation();
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  return (
    <>
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

      <View style={styles.container}>
        <View
          style={{
            paddingHorizontal: '8%',
            flex: 1,
          }}
        >
          {/* Display register prompt text and img background */}
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
              Ask your Family Head for the Family Code generated on their
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

          {/* Button for login */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Button
              mode="contained"
              style={{
                backgroundColor: '#FF4C38',
                marginVertical: 10,
                borderRadius: 5,
              }}
              contentStyle={{ padding: 3 }}
              onPress={() => {
                handleSignIn();
              }}
            >
              Next
            </Button>
          </View>
        </View>
      </View>
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