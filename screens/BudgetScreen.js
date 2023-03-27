import {
  ScrollView,
  StyleSheet,
  TextInput as NativeTextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {
  Button,
  HelperText,
  TextInput,
  Text,
  List,
  Surface,
  Avatar,
} from 'react-native-paper';
import { handleAmountChange } from '../Helper/FormatFunctions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { expenseCategories, incomeCategories } from '../Helper/CategoriesData';

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

const BudgetScreen = () => {
  const [segmentValue, setSegmentValue] = useState('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorDateString: false,
    errorAmount: false,
    errorDescription: false,
    errorCategory: false,
  });

  const handleCategoryPress = () => setExpanded(!expanded);
  // hooks
  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ['90%'], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log('handleSheetChange', index);
    if (index === -1) {
      console.log('-1');
    }
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);

  // render
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    []
  );

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
    <View style={styles.container}>
      <Button
        mode="contained"
        icon="plus"
        onPress={() => handleSnapPress(0)}
        style={{ width: '100%' }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Budget</Text>
      </Button>
      {/* <Button title="Close" onPress={() => handleClosePress()} /> */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChange}
        cl
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          <SegmentedButtons
            value={segmentValue}
            onValueChange={setSegmentValue}
            buttons={[
              {
                value: 'income',
                label: 'Family Budget',
                disabled: false,
              },
              {
                value: 'expense',
                label: 'Expense',
                disabled: false,
              },
            ]}
          />

          <TextInput
            mode="outlined"
            label="Amount"
            outlineColor="#F5F6FA"
            outlineStyle={{ borderRadius: 5 }}
            activeOutlineColor="#151940"
            value={amount}
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
              style={[styles.surface, { display: expanded ? 'flex' : 'none' }]}
              elevation={2}
            >
              <ScrollView style={{ width: '100%' }} nestedScrollEnabled={true}>
                {segmentValue === 'income'
                  ? incomeCategories.map(renderCategoryItems)
                  : expenseCategories.map(renderCategoryItems)}
              </ScrollView>
            </Surface>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default BudgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: 'white',
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: '#eee',
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
