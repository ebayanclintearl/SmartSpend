import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput as NativeTextInput,
  StatusBar,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  Appbar,
  Avatar,
  Button,
  TextInput,
  Text,
  Surface,
  List,
  HelperText,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { expenseCategories, incomeCategories } from '../Helper/CategoriesData';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { AppContext } from '../Helper/Context';
import { db } from '../config';
import {
  formatDateAndTime,
  handleAmountChange,
} from '../Helper/FormatFunctions';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import { validateTransactionInputs } from '../Helper/Validation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SegmentedButtons = ({ value, onValueChange, buttons }) => (
  <View
    style={{
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      marginTop: 5,
      marginBottom: 15,
    }}
  >
    {buttons.map(({ value: buttonValue, label, disabled }) => (
      <Button
        key={buttonValue}
        mode="contained"
        contentStyle={{ padding: 3 }}
        style={
          value === buttonValue
            ? {
                backgroundColor:
                  buttonValue === 'income'
                    ? '#38B6FF'
                    : buttonValue === 'expense'
                    ? '#FF4C38'
                    : '#F5F6FA',
                borderRadius: 8,
                width: '49%',
              }
            : {
                backgroundColor: '#F5F6FA',
                borderRadius: 8,
                width: '49%',
              }
        }
        labelStyle={{
          color:
            value === buttonValue
              ? '#FFFFFF'
              : disabled
              ? '#7F8192'
              : '#151940',
        }}
        onPress={() => onValueChange(buttonValue)}
        disabled={disabled}
      >
        {label}
      </Button>
    ))}
  </View>
);

const AddScreen = ({ route }) => {
  const navigation = useNavigation();
  const { transactionId } = route.params ?? {};
  const { userAccount, familyCode } = useContext(AppContext);
  const [date, setDate] = useState(new Date());
  const [dateString, setDateString] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [segmentValue, setSegmentValue] = useState('income');
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorDateString: false,
    errorAmount: false,
    errorDescription: false,
    errorCategory: false,
  });

  // This code block sets up the initial state for a form
  useEffect(() => {
    if (transactionId) {
      const transactionInfo = familyCode?.familyExpenseHistory[transactionId];
      const { date, amount, description, category, type } = transactionInfo;
      currentDateAndTime(date.toDate());
      handleAmountChange(amount, setAmount);
      setDescription(description);
      setCategory(category);
      setSegmentValue(type);
    } else {
      currentDateAndTime(new Date());
    }
    userAccount?.type === 'member' && setSegmentValue('expense');
  }, []);

  // This code block clears the category field
  useEffect(() => {
    if (transactionId) return;
    setCategory(null);
  }, [segmentValue]);

  const handleCategoryPress = () => setExpanded(!expanded);
  const handleDateConfirm = (date) => {
    setDatePickerVisibility(false);
    currentDateAndTime(date);
  };
  const currentDateAndTime = (date) => {
    setDateString(formatDateAndTime(date));
    setDate(date);
  };

  const handleSave = async () => {
    const validationResult = validateTransactionInputs(
      dateString,
      amount,
      description,
      category
    );
    setError(validationResult);
    if (validationResult.errorMessage) return;
    try {
      setShowLoading(true);

      const transaction = {
        uid: userAccount.uid,
        name: userAccount.name,
        date: date,
        amount: parseFloat(amount.replace(/,/g, '')),
        description: description,
        accountType: userAccount.type,
        type: segmentValue,
        category: {
          title: category.title,
          icon: category.icon,
          color: category.color,
        },
      };

      const familyCodeRef = doc(
        db,
        'familyCodes',
        userAccount?.code.toString()
      );

      if (transactionId) {
        await updateDoc(familyCodeRef, {
          ['familyExpenseHistory.' + transactionId]: transaction,
        });
        navigation.navigate('ExpenseHistoryScreen');
      } else {
        await setDoc(
          familyCodeRef,
          {
            familyExpenseHistory: {
              [uuid.v4()]: transaction,
            },
          },
          { merge: true }
        );
        navigation.pop();
      }

      setShowLoading(false);
    } catch (error) {
      console.error(error);
      setShowLoading(false);
    }
  };

  const renderCategoryItems = (item) => (
    <List.Item
      key={item.id}
      title={item.title}
      left={(props) => (
        <List.Icon
          {...props}
          icon={() => (
            <Avatar.Icon
              size={45}
              icon={item.icon}
              color="#FFFFFF"
              style={{
                backgroundColor: item.color,
              }}
            />
          )}
        />
      )}
      onPress={() => {
        setCategory(item);
        handleCategoryPress();
      }}
    />
  );
  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      <Appbar.Header
        mode="center-aligned"
        style={{ backgroundColor: '#FFFFFF' }}
      >
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
        <Appbar.Content
          title={
            <Text variant="labelLarge" style={{ fontSize: 24, lineHeight: 30 }}>
              {transactionId ? 'EDIT' : 'ADD'}
            </Text>
          }
        />
      </Appbar.Header>
      <SafeAreaProvider>
        <DateTimePickerModal
          date={date}
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />
        <View style={styles.container}>
          <ScrollView>
            <View style={{ paddingHorizontal: '3%' }}>
              <SegmentedButtons
                value={segmentValue}
                onValueChange={setSegmentValue}
                buttons={[
                  {
                    value: 'income',
                    label: 'Family Budget',
                    disabled: transactionId
                      ? segmentValue === 'income'
                        ? false
                        : true
                      : userAccount?.type === 'member'
                      ? true
                      : false,
                  },
                  {
                    value: 'expense',
                    label: 'Expense',
                    disabled: transactionId
                      ? segmentValue === 'income'
                        ? true
                        : false
                      : false,
                  },
                ]}
              />

              <TouchableWithoutFeedback
                onPress={() => setDatePickerVisibility(true)}
              >
                <View style={{ width: '100%' }}>
                  <TextInput
                    mode="outlined"
                    label="Date & Time"
                    outlineColor="#F5F6FA"
                    outlineStyle={{ borderRadius: 5 }}
                    value={dateString}
                    editable={false}
                    style={{
                      marginVertical: 5,
                      backgroundColor: '#F5F6FA',
                    }}
                    right={
                      <TextInput.Icon
                        icon={({ size }) => (
                          <Icon name="calendar" size={size} color="#7F8192" />
                        )}
                        disabled={true}
                        forceTextInputFocus={false}
                      />
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
              {error.errorDateString && (
                <HelperText type="error" visible={error.errorDateString}>
                  {error.errorMessage}
                </HelperText>
              )}

              <TextInput
                mode="outlined"
                label="Amount"
                outlineColor="#F5F6FA"
                outlineStyle={{ borderRadius: 5 }}
                activeOutlineColor="#151940"
                value={amount.toString()}
                error={error.errorAmount}
                style={{
                  marginVertical: 5,
                  backgroundColor: '#F5F6FA',
                  width: '100%',
                }}
                onChangeText={(value) => handleAmountChange(value, setAmount)}
                render={(props) => (
                  <NativeTextInput {...props} keyboardType={'numeric'} />
                )}
                right={
                  <TextInput.Icon
                    icon={({ size }) => (
                      <Icon name="currency-php" size={size} color="#7F8192" />
                    )}
                    disabled={true}
                    forceTextInputFocus={false}
                  />
                }
              />
              {error.errorAmount && (
                <HelperText type="error" visible={error.errorAmount}>
                  {error.errorMessage}
                </HelperText>
              )}

              <TextInput
                mode="outlined"
                label="Description"
                outlineColor="#F5F6FA"
                outlineStyle={{ borderRadius: 5 }}
                activeOutlineColor="#151940"
                value={description}
                error={error.errorDescription}
                style={{
                  marginVertical: 5,
                  backgroundColor: '#F5F6FA',
                  width: '100%',
                }}
                onChangeText={(description) => setDescription(description)}
                right={
                  <TextInput.Icon
                    icon={({ size }) => (
                      <Icon
                        name="note-plus-outline"
                        size={size}
                        color="#7F8192"
                      />
                    )}
                    disabled={true}
                    forceTextInputFocus={false}
                  />
                }
              />
              {error.errorDescription && (
                <HelperText type="error" visible={error.errorDescription}>
                  {error.errorMessage}
                </HelperText>
              )}

              <View style={{ alignItems: 'center' }}>
                <TouchableWithoutFeedback onPress={() => handleCategoryPress()}>
                  <View style={{ width: '100%' }}>
                    <TextInput
                      mode="outlined"
                      outlineColor="#F5F6FA"
                      outlineStyle={{ borderRadius: 5 }}
                      value={category ? category.title : 'Select Category'}
                      error={error.errorCategory}
                      style={{
                        marginVertical: 5,
                        backgroundColor: '#F5F6FA',
                      }}
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon={({ size }) => (
                            <Icon
                              name="chevron-down"
                              size={size + 10}
                              color="#7F8192"
                            />
                          )}
                          disabled={true}
                          forceTextInputFocus={false}
                        />
                      }
                    />
                  </View>
                </TouchableWithoutFeedback>
                {error.errorCategory && (
                  <HelperText type="error" visible={error.errorCategory}>
                    {error.errorMessage}
                  </HelperText>
                )}
                <Surface
                  style={[
                    styles.surface,
                    { display: expanded ? 'flex' : 'none' },
                  ]}
                  elevation={2}
                >
                  <ScrollView style={{ flex: 1, width: '100%' }}>
                    {segmentValue === 'income'
                      ? incomeCategories.map(renderCategoryItems)
                      : expenseCategories.map(renderCategoryItems)}
                  </ScrollView>
                </Surface>
              </View>
              <Button
                mode="contained"
                compact={true}
                loading={showLoading}
                buttonColor={segmentValue === 'income' ? '#38B6FF' : '#FF4C38'}
                onPress={() => handleSave()}
                contentStyle={{ padding: 3 }}
                style={{
                  borderRadius: 5,
                  display: expanded ? 'none' : 'flex',
                  marginVertical: 30,
                }}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </View>
      </SafeAreaProvider>
    </>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  surface: {
    padding: 8,
    height: 225,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
