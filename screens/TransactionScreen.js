import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TextInput as NativeTextInput,
  TouchableOpacity,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  TextInput,
  Text,
  Surface,
  List,
  SegmentedButtons,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { expenseCategories, incomeCategories } from '../Helper/CategoriesData';
import {
  arrayUnion,
  collection,
  doc,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { AccountContext, AppContext } from '../Helper/Context';
import { db } from '../config';
import {
  formatDateAndTime,
  handleAmountChange,
} from '../Helper/FormatFunctions';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import { validateTransactionInputs } from '../Helper/Validation';

const TransactionScreen = ({ route }) => {
  const navigation = useNavigation();
  const { transactionId } = route.params ?? {};
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
  const { userAccount, familyCode } = useContext(AppContext);
  const theme = useTheme();

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
      const docRef = doc(db, 'familyCodes', userAccount?.code.toString());

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

      if (transactionId) {
        await updateDoc(docRef, {
          ['familyExpenseHistory.' + transactionId]: transaction,
        });
        navigation.navigate('HomeTabScreen');
      } else {
        await setDoc(
          docRef,
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
      left={(props) => <List.Icon {...props} icon={item.icon} />}
      onPress={() => {
        setCategory(item);
        handleCategoryPress();
      }}
    />
  );
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.pop();
          }}
        />
      </Appbar.Header>

      <View
        style={{
          paddingHorizontal: 10,
          paddingBottom: 10,
          backgroundColor: theme.colors.onPrimary,
        }}
      >
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
          style={{ border: 'none' }}
        />
      </View>
      <SafeAreaProvider style={{ zIndex: -1 }}>
        <DateTimePickerModal
          date={date}
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />
        <ScrollView>
          <View style={styles.container}>
            <View
              style={{
                justifyContent: 'center',
                width: '90%',
              }}
            >
              <TouchableWithoutFeedback
                onPress={() => setDatePickerVisibility(true)}
              >
                <View style={{ width: '100%' }}>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                    Date and time *
                  </Text>
                  <TextInput
                    value={dateString}
                    editable={false}
                    right={
                      <TextInput.Icon
                        icon="calendar"
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

              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                Amount *
              </Text>
              <TextInput
                value={amount.toString()}
                error={error.errorAmount}
                style={{ width: '100%' }}
                onChangeText={(value) => handleAmountChange(value, setAmount)}
                render={(props) => (
                  <NativeTextInput {...props} keyboardType={'numeric'} />
                )}
                right={
                  <TextInput.Icon
                    icon="currency-php"
                    forceTextInputFocus={false}
                  />
                }
              />
              {error.errorAmount && (
                <HelperText type="error" visible={error.errorAmount}>
                  {error.errorMessage}
                </HelperText>
              )}

              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                Description *
              </Text>
              <TextInput
                value={description}
                error={error.errorDescription}
                style={{ width: '100%' }}
                onChangeText={(description) => setDescription(description)}
                right={
                  <TextInput.Icon icon="note" forceTextInputFocus={false} />
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
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                      Category *
                    </Text>
                    <TextInput
                      value={category ? category.title : 'Select Category'}
                      error={error.errorCategory}
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon="chevron-down-box-outline"
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
                  <ScrollView style={{ width: '100%' }}>
                    {segmentValue === 'income'
                      ? incomeCategories.map(renderCategoryItems)
                      : expenseCategories.map(renderCategoryItems)}
                  </ScrollView>
                </Surface>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaProvider>
      <View
        style={{
          padding: 10,
          backgroundColor: theme.colors.inverseOnSurface,
        }}
      >
        <Button
          mode="contained"
          compact={true}
          loading={showLoading}
          buttonColor={segmentValue === 'income' ? '#028a0f' : '#a91b0d'}
          onPress={() => handleSave()}
        >
          Save
        </Button>
      </View>
    </>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  surface: {
    padding: 8,
    height: 225,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
