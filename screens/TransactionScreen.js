import React, { useEffect, useState } from 'react';
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
} from 'react-native-paper';
TextInput;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { expenseCategories } from '../Helper/CategoriesData';

const TransactionScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState({});
  const handlePress = () => setExpanded(!expanded);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleDateConfirm = (date) => {
    setDateTime(date);
    setDatePickerVisibility(false);
  };

  const setDateTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    setDate(
      date.getMonth() +
        1 +
        '/' +
        date.getDate() +
        '/' +
        date.getFullYear() +
        ' - ' +
        strTime
    );
  };

  useEffect(() => {
    setDateTime(new Date());
  }, []);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.pop();
          }}
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
              <TouchableWithoutFeedback
                onPress={() => setDatePickerVisibility(true)}
              >
                <View style={{ width: '100%' }}>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                    Date and time *
                  </Text>
                  <TextInput
                    value={date}
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
                    {expenseCategories &&
                      expenseCategories.map((expense) => (
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
              <Button mode="contained" onPress={() => console.log('Pressed')}>
                Add Expense
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
