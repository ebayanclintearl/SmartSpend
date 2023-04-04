import { StatusBar, StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { AccountContext, AppContext } from '../Helper/Context';
import { Appbar, Avatar, Button, Text } from 'react-native-paper';
import {
  formatCurrency,
  formatDateAndTime,
  hexToRgba,
} from '../Helper/FormatFunctions';
import { useNavigation } from '@react-navigation/native';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config';

const TransactionDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { transactionId } = route.params;
  const { userAccount, familyCode } = useContext(AppContext);
  const transaction = familyCode?.familyExpenseHistory[transactionId];
  const handleRemove = async () => {
    try {
      navigation.pop();
      const docRef = doc(db, 'familyCodes', userAccount?.code.toString());
      await updateDoc(docRef, {
        ['familyExpenseHistory.' + transactionId]: deleteField(),
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleEdit = async () => {
    navigation.navigate('TransactionScreen', {
      transactionId: transactionId,
    });
  };
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
              DETAILS
            </Text>
          }
        />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={{ paddingHorizontal: '3%', flex: 1 }}>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: hexToRgba(transaction?.category?.color, 0.1),
              padding: 10,
              marginVertical: 8,
              borderRadius: 12,
            }}
          >
            <Avatar.Icon
              size={45}
              icon={transaction?.category?.icon}
              color="#FFFFFF"
              style={{
                backgroundColor: transaction?.category?.color,
              }}
            />
            <Text
              variant="displaySmall"
              style={{ color: '#151940', fontSize: 25 }}
            >
              {transaction?.category?.title}
            </Text>
            <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
              {transaction?.name}
            </Text>
            <Text
              variant="displaySmall"
              style={{
                color: transaction?.type === 'income' ? '#38B6FF' : '#FF4C38',
                fontSize: 30,
              }}
            >
              Php {formatCurrency(transaction?.amount)}
            </Text>
            <Text
              variant="titleLarge"
              style={{ color: '#151940', fontSize: 16 }}
            >
              {transaction?.description}
            </Text>
            <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
              {transaction?.date &&
                formatDateAndTime(transaction?.date?.toDate())}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: '100%',
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}
            >
              <Button
                mode="contained"
                icon="pencil"
                onPress={() => handleEdit()}
                contentStyle={{ padding: 3, flexDirection: 'row-reverse' }}
                labelStyle={{
                  color: '#FFFFFF',
                }}
                style={{
                  backgroundColor: '#38B6FF',
                  borderRadius: 8,
                  width: '49%',
                }}
              >
                Edit
              </Button>
              <Button
                mode="contained"
                icon="trash-can"
                onPress={() => handleRemove()}
                contentStyle={{ padding: 3, flexDirection: 'row-reverse' }}
                labelStyle={{
                  color: '#FFFFFF',
                }}
                style={{
                  backgroundColor: '#FF4C38',
                  borderRadius: 8,
                  width: '49%',
                }}
              >
                Remove
              </Button>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default TransactionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
