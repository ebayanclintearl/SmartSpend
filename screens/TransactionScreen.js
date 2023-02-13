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
TextInput;
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
import { AccountContext } from '../Helper/Context';
import { db } from '../config';
import { formatDateAndTime } from '../Helper/FormatFunctions';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';
import { validateTransactionInputs } from '../Helper/Validation';

const TransactionScreen = ({ route }) => {
  const navigation = useNavigation();
  const { transactionID } = route.params || {};
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateString, setDateString] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState({ title: 'Select Category' });
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

  const { accountInfo, accountsInfo } = useContext(AccountContext);
  const theme = useTheme();

  useEffect(() => {
    currentDateAndTime(new Date());
    console.log(transactionID);
    accountInfo?.type === 'member' && setSegmentValue('expense');
  }, []);
  useEffect(() => {
    setCategory({ title: 'Select Category' });
  }, [segmentValue]);

  const handlePress = () => setExpanded(!expanded);
  const handleDateConfirm = (date) => {
    currentDateAndTime(date);
    setDatePickerVisibility(false);
  };
  const currentDateAndTime = (date) => {
    setDate(date);
    setDateString(formatDateAndTime(null, date));
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
      const docRef = doc(db, 'familyGroup', accountInfo?.code);

      const transaction = {
        name: accountInfo.name,
        date: date,
        amount: amount,
        description: description,
        type: segmentValue,
        category: {
          title: category.title,
          icon: category.icon,
        },
      };

      setDoc(
        docRef,
        {
          transactions: {
            [uuid.v4()]: transaction,
          },
        },
        { merge: true }
      );

      setShowLoading(false);
      navigation.pop();
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
        handlePress();
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
      {accountInfo?.type === 'provider' && (
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
              },
              {
                value: 'expense',
                label: 'Expense',
              },
            ]}
            style={{ border: 'none' }}
          />
        </View>
      )}
      <SafeAreaProvider style={{ zIndex: -1 }}>
        <DateTimePickerModal
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
                    right={
                      <TextInput.Icon
                        icon="calendar"
                        forceTextInputFocus={false}
                      />
                    }
                    editable={false}
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
                value={amount}
                error={error.errorAmount}
                style={{ width: '100%' }}
                onChangeText={(amount) => setAmount(amount)}
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
                <TouchableWithoutFeedback onPress={() => handlePress()}>
                  <View style={{ width: '100%' }}>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                      Category *
                    </Text>
                    <TextInput
                      right={
                        <TextInput.Icon
                          icon="chevron-down-box-outline"
                          forceTextInputFocus={false}
                        />
                      }
                      value={category.title}
                      editable={false}
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
