import { StyleSheet, View, TextInput as NativeTextInput } from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Appbar,
  Text,
  Button,
  TextInput,
  IconButton,
  HelperText,
  Surface,
  List,
} from 'react-native-paper';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import { handleAmountChange } from '../../Helper/FormatFunctions';
import { expenseCategories } from '../../Helper/CategoriesData';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
const BudgetRoute = () => {
  const [budgetName, setBudgetName] = useState('');
  const [amount, setAmount] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [expandedDateRange, setExpandedDateRange] = useState(false);
  const [category, setCategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorDateString: false,
    errorAmount: false,
    errorBudgetName: false,
    errorCategory: false,
    errorDateRange: false,
  });
  // hooks
  const sheetRef = useRef(null);

  // variables
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    []
  );
  const snapPoints = useMemo(() => ['90%'], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log('handleSheetChange', index);
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // render
  const renderItem = useCallback(
    (item) => (
      <View key={item} style={styles.itemContainer}>
        <Text>{item}</Text>
      </View>
    ),
    []
  );
  const handleDateRangePress = () => setExpandedDateRange(!expandedDateRange);
  const handleCategoryPress = () => setExpandedCategory(!expandedCategory);
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
        <Appbar.Content title="Title" />
      </Appbar.Header>
      <View style={styles.container}>
        <Button mode="contained" onPress={() => handleSnapPress(0)}>
          Snap to 90%
        </Button>
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainer}
          >
            <View style={{ width: '90%', alignSelf: 'center', flex: 1 }}>
              <IconButton
                icon="close"
                iconColor={'black'}
                size={28}
                onPress={() => handleClosePress()}
                style={{ alignSelf: 'flex-end' }}
              />
              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                Budget Name*
              </Text>
              <TextInput
                mode="outlined"
                value={budgetName}
                error={error.errorBudgetName}
                style={{ width: '100%' }}
                onChangeText={(budgetName) => setBudgetName(budgetName)}
                right={
                  <TextInput.Icon icon="note" forceTextInputFocus={false} />
                }
              />
              <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                Amount *
              </Text>
              <TextInput
                mode="outlined"
                value={amount}
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

              <Pressable onPress={handleDateRangePress}>
                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                  Date Range *
                </Text>
                <TextInput
                  mode="outlined"
                  value={dateRange ? dateRange : 'Select DateRange'}
                  error={error.errorDateRange}
                  editable={false}
                  right={
                    <TextInput.Icon
                      icon="chevron-down-box-outline"
                      forceTextInputFocus={false}
                    />
                  }
                />
              </Pressable>
              {error.errorDateRange && (
                <HelperText type="error" visible={error.errorDateRange}>
                  {error.errorMessage}
                </HelperText>
              )}
              <Surface
                style={[
                  styles.surface,
                  { display: expandedDateRange ? 'flex' : 'none' },
                ]}
              >
                <ScrollView style={{ flex: 1, width: '100%' }}>
                  <List.Item
                    title="Daily"
                    onPress={() => {
                      setDateRange('Daily');
                      handleDateRangePress();
                    }}
                  />
                  <List.Item
                    title="Weekly"
                    onPress={() => {
                      setDateRange('Daily');
                      handleDateRangePress();
                    }}
                  />
                  <List.Item
                    title="Monthly"
                    onPress={() => {
                      setDateRange('Daily');
                      handleDateRangePress();
                    }}
                  />
                </ScrollView>
              </Surface>

              <Pressable onPress={handleCategoryPress}>
                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                  Category *
                </Text>
                <TextInput
                  mode="outlined"
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
              </Pressable>
              {error.errorCategory && (
                <HelperText type="error" visible={error.errorCategory}>
                  {error.errorMessage}
                </HelperText>
              )}
              <Surface
                style={[
                  styles.surface,
                  { display: expandedCategory ? 'flex' : 'none' },
                ]}
              >
                <ScrollView style={{ flex: 1, width: '100%' }}>
                  {expenseCategories.map(renderCategoryItems)}
                </ScrollView>
              </Surface>
              {/* {data.map(renderItem)} */}
              <Button
                mode="contained"
                compact={true}
                onPress={() => handleSave()}
              >
                Save
              </Button>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </>
  );
};

export default BudgetRoute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
    backgroundColor: 'grey',
  },
  contentContainer: {
    backgroundColor: 'white',
  },
  itemContainer: {
    padding: 6,
    margin: 6,
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
