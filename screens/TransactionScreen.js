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
} from 'react-native-paper';
TextInput;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { expenseCategories } from '../Helper/CategoriesData';
import {
  arrayUnion,
  collection,
  doc,
  query,
  updateDoc,
} from 'firebase/firestore';
import { AccountContext } from '../Helper/Context';
import { db } from '../config';

const TransactionScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateString, setDateString] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [segmentValue, setSegmentValue] = useState('income');
  const handlePress = () => setExpanded(!expanded);
  const [error, setError] = useState('');

  const handleDateConfirm = (date) => {
    formatDateAndTime(date);
    setDatePickerVisibility(false);
  };
  const { accountInfo, accountsInfo } = useContext(AccountContext);
  const handleSave = async () => {
    if (!dateString.trim()) {
      setError('Empty Date');
      console.log(true);
      return;
    }
    if (!amount.trim()) {
      setError('Empty amount');
      return;
    }
    if (!description.trim()) {
      setError('Empty Description');
      return;
    }
    if (Object.keys(category).length === 0) {
      setError('Empty category');
      return;
    }
    const docRef = doc(db, 'familyGroup', accountInfo?.code);

    await updateDoc(docRef, {
      transactions: arrayUnion({
        name: accountInfo.name,
        uid: accountInfo.uid,
        date: date,
        amount: amount,
        description: description,
        category: {
          id: category.id,
          title: category.title,
          icon: category.icon,
          type: 'expense',
        },
      }),
    });
  };

  const formatDateAndTime = (date) => {
    setDate(date);
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = 'AM';

    if (hours >= 12) {
      hours -= 12;
      ampm = 'PM';
    }
    if (hours === 0) {
      hours = 12;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    setDateString(`${day} ${monthName} ${year} - ${hours}:${minutes} ${ampm}`);
  };

  useEffect(() => {
    formatDateAndTime(new Date());
  }, []);

  return (
    <>
      <Appbar.Header mode="medium">
        <Appbar.BackAction
          onPress={() => {
            navigation.pop();
          }}
        />
        <Appbar.Content
          title={
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
            />
          }
        />
      </Appbar.Header>
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
              {error && <Text>{error}</Text>}
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

              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                Amount *
              </Text>
              <TextInput
                value={amount}
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
              <View style={{ alignItems: 'center' }}>
                <TouchableWithoutFeedback onPress={() => handlePress()}>
                  <View style={{ width: '100%' }}>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                      Expense Category *
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
                <Surface
                  style={[
                    styles.surface,
                    { display: expanded ? 'flex' : 'none' },
                  ]}
                  elevation={2}
                >
                  <ScrollView style={{ width: '100%' }}>
                    {expenseCategories?.map((expense) => (
                      <List.Item
                        key={expense.id}
                        title={expense.title}
                        left={(props) => (
                          <List.Icon {...props} icon={expense.icon} />
                        )}
                        onPress={() => {
                          setCategory(expense);
                          handlePress();
                        }}
                      />
                    ))}
                  </ScrollView>
                </Surface>
              </View>
              <Button mode="contained" onPress={() => handleSave()}>
                Save
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaProvider>
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
