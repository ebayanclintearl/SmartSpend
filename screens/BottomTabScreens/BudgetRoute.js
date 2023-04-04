import {
  StyleSheet,
  View,
  TextInput as NativeTextInput,
  Keyboard,
} from 'react-native';
import React, {
  useCallback,
  useContext,
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
  Card,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import { handleAmountChange } from '../../Helper/FormatFunctions';
import { expenseCategories } from '../../Helper/CategoriesData';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import { validateBudgetInputs } from '../../Helper/Validation';
import { AccountContext, AppContext } from '../../Helper/Context';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';
import { db } from '../../config';

const BudgetRoute = () => {
  const { userAccount, familyCode } = useContext(AppContext);
  const [showLoading, setShowLoading] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [amount, setAmount] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [category, setCategory] = useState(null);
  const [expandedDateRange, setExpandedDateRange] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(false);
  const [isBackdropEnabled, setIsBackdropEnabled] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorBudgetName: false,
    errorAmount: false,
    errorDateRange: false,
    errorCategory: false,
  });
  // hooks
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['80%'], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log('handleSheetChange', index);
  }, []);
  const handleSnapPress = useCallback((index) => {
    setIsBackdropEnabled(true);
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleClosePress = useCallback(() => {
    setIsBackdropEnabled(false);
    sheetRef.current?.close();
  }, []);

  // backdrop for bottom sheets
  const renderBackdrop = () => (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    />
  );

  const handleDateRangePress = () => setExpandedDateRange(!expandedDateRange);
  const handleCategoryPress = () => setExpandedCategory(!expandedCategory);

  const handleSave = async () => {
    const validationResult = validateBudgetInputs(
      budgetName,
      amount,
      dateRange,
      category
    );
    setError(validationResult);

    if (validationResult.errorMessage) return;
    try {
      setShowLoading(true);
      const docRef = doc(db, 'familyGroup', userAccount?.code);

      const { startDate, endDate } = getDateRange(dateRange.toLowerCase());

      const budget = {
        name: userAccount.name,
        budgetName: budgetName,
        amount: amount,
        dateRange: dateRange.toLowerCase(),
        accountType: userAccount.type,
        category: {
          title: category.title,
          icon: category.icon,
        },
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
      };

      setDoc(
        docRef,
        {
          budgets: {
            [uuid.v4()]: budget,
          },
        },
        { merge: true }
      );

      setShowLoading(false);
      handleClosePress();
    } catch (error) {
      console.error(error);
      setShowLoading(false);
    }
  };

  const handleSuggest = async () => {
    try {
      setShowLoading(true);
      const docRef = doc(db, 'familyGroup', userAccount?.code);
      const budgetList = await createCategoryBudgets(familyCode, 100);
      setDoc(
        docRef,
        {
          budgets: budgetList,
        },
        { merge: true }
      );

      setShowLoading(false);
      handleClosePress();
    } catch (error) {
      console.error(error);
      setShowLoading(false);
    }
  };

  function getDateRange(dateRange) {
    const date = new Date(); // Get the current date
    let startDate, endDate;

    switch (dateRange) {
      case 'day':
        startDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        endDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        );
        break;
      case 'week':
        startDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        endDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - date.getDay() + 7
        );
        break;
      case 'month':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      default:
        throw new Error('Invalid date range');
    }

    return { startDate, endDate };
  }
  // Wait until the data is fetched, then extract the transactions and budgets
  const { transactions = {}, budgets = {} } = familyCode || {};

  // Filter transactions by date range
  function filterTransactionsByDateRange(transactions, timeRange, budget) {
    const startDate = budget.dateRangeStart.toDate();
    const endDate = budget.dateRangeEnd.toDate();

    return Object.entries(transactions)?.filter(([key, { date, category }]) => {
      const transactionDate = date.toDate();
      return (
        transactionDate >= startDate &&
        transactionDate <= endDate &&
        budget.dateRange === timeRange &&
        category.title === budget.category.title
      );
    });
  }

  // Compute the budget summary for a given time range
  function computeBudgetSummary(timeRange) {
    const filteredBudgets = Object.entries(budgets)?.filter(
      ([_, { dateRange }]) => dateRange === timeRange
    );

    return filteredBudgets.reduce((budgetSummary, [key, budget]) => {
      const { category, amount, budgetName } = budget;
      const budgetAmount = parseFloat(amount.replace(/,/g, ''));
      const filteredTransactions = filterTransactionsByDateRange(
        transactions,
        timeRange,
        budget
      );
      const totalAmount = filteredTransactions.reduce(
        (total, [, { amount }]) => total + parseFloat(amount.replace(/,/g, '')),
        0
      );
      const percentage = Math.min(totalAmount / budgetAmount, 1);
      budgetSummary.push({
        budgetID: key,
        budgetName,
        budgetCategory: category.title,
        budgetAmount,
        totalAmount: totalAmount.toFixed(2),
        percentage: parseFloat(percentage.toFixed(2)),
        budgetStartDate: budget.dateRangeStart.toDate(),
        budgetEndDate: budget.dateRangeEnd.toDate(),
      });
      if (percentage >= 1) {
        console.log('Alert Budget reach the limit');
      }

      return budgetSummary;
    }, []);
  }
  const budgetSummaryForDay = computeBudgetSummary('day');
  const budgetSummaryForWeek = computeBudgetSummary('week');
  const budgetSummaryForMonth = computeBudgetSummary('month');

  function getCategoryStatistics(familyCode, budget) {
    // If familyCode is undefined, return an empty object
    if (!familyCode) {
      return { distributed: {} };
    }

    // Extract transaction categories from familyCode
    const transactions = familyCode.transactions;
    const categoryTitles = Object.entries(transactions).map(
      ([transactionId, transaction]) => transaction.category.title
    );

    // Calculate frequency of each category
    const categoryStats = categoryTitles.reduce(
      (acc, title) => {
        acc.freq[title] = (acc.freq[title] || 0) + 1;
        return acc;
      },
      { freq: {}, distributed: {} }
    );

    // Create an array of categories sorted by frequency
    const categories = Object.keys(categoryStats.freq).map((title) => ({
      title,
      percent: categoryStats.freq[title] / categoryTitles.length,
      value: 0,
      icon: transactions[
        Object.keys(transactions).find(
          (transactionId) =>
            transactions[transactionId].category.title === title
        )
      ].category.icon,
    }));

    categories.sort((a, b) => b.percent - a.percent);

    // Use knapsack algorithm to distribute budget among categories
    for (let i = 0; i < categories.length; i++) {
      const { title, percent } = categories[i];
      const value = Math.floor(percent * budget);

      if (value === 0) {
        break;
      }

      const capacity =
        budget -
        categories.slice(0, i).reduce((acc, { value }) => acc + value, 0);
      const weight = Math.min(value, capacity);
      categories[i].value = weight;
    }

    // Calculate distributed budget for each category
    categoryStats.distributed = categories.reduce(
      (acc, { title, value, icon }) => {
        acc[title] = { value, icon };
        return acc;
      },
      {}
    );

    // Return distributed budget for each category with title and icon
    return categoryStats.distributed;
  }

  async function createCategoryBudgets(familyCode, budget) {
    const categoryStats = getCategoryStatistics(familyCode, budget);
    const categoryBudgets = {};

    if (!familyCode) {
      return categoryBudgets;
    }
    if (!categoryStats) {
      return categoryBudgets;
    }

    for (const [categoryTitle, categoryData] of Object.entries(categoryStats)) {
      const budgetId = uuid.v4();

      const { startDate, endDate } = getDateRange('day');

      categoryBudgets[budgetId] = {
        name: userAccount.name,
        budgetName: `${categoryTitle} Budget`,
        amount: categoryData.value.toString(),
        dateRange: 'day',
        accountType: userAccount.type,
        category: {
          title: categoryTitle,
          icon: categoryData.icon,
        },
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
      };
    }

    return Promise.resolve(categoryBudgets);
  }

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
        <Button
          mode="contained"
          icon="plus"
          onPress={() => handleSnapPress(0)}
          style={{ width: '100%' }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Budget</Text>
        </Button>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            handleSuggest();
          }}
          style={{ width: '100%' }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Suggest Budget
          </Text>
        </Button>
        <ScrollView>
          {budgetSummaryForDay.length !== 0 && (
            <Card>
              <Card.Content>
                <Text variant="titleLarge">Daily</Text>
                <Divider />
                {budgetSummaryForDay?.map((summary) => (
                  <Pressable
                    key={summary.budgetID}
                    onPress={() => console.log('hello')}
                  >
                    <View style={{ marginVertical: 5, width: '100%' }}>
                      <Text variant="titleMedium">{summary.budgetName}</Text>
                      <Text variant="titleSmall">{summary.budgetCategory}</Text>
                      <Text variant="bodyLarge">{summary.budgetAmount}</Text>
                      <ProgressBar progress={summary.percentage} color="blue" />
                      <Divider bold={true} style={{ marginVertical: 5 }} />
                    </View>
                  </Pressable>
                ))}
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        backdropComponent={isBackdropEnabled ? renderBackdrop : null}
        footerComponent={() => (
          <View
            style={{
              width: '100%',
              backgroundColor: 'white',
              paddingVertical: 5,
              paddingHorizontal: 15,
            }}
          >
            <Button
              mode="contained"
              compact={true}
              loading={showLoading}
              onPress={() => {
                Keyboard.dismiss();
                handleSave();
              }}
            >
              Save
            </Button>
          </View>
        )}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          <View style={{ width: '90%', alignSelf: 'center', flex: 1 }}>
            <IconButton
              icon="close"
              iconColor={'black'}
              size={28}
              onPress={() => {
                handleClosePress();
                setBudgetName('');
                setAmount('');
                setDateRange('');
                setCategory(null);
              }}
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
              right={<TextInput.Icon icon="note" forceTextInputFocus={false} />}
            />
            {error.errorBudgetName && (
              <HelperText type="error" visible={error.errorBudgetName}>
                {error.errorMessage}
              </HelperText>
            )}
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
                  title="Day"
                  onPress={() => {
                    setDateRange('Day');
                    handleDateRangePress();
                  }}
                />
                <List.Item
                  title="Week"
                  onPress={() => {
                    setDateRange('Week');
                    handleDateRangePress();
                  }}
                />
                <List.Item
                  title="Month"
                  onPress={() => {
                    setDateRange('Month');
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
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
};

export default BudgetRoute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
