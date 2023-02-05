import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button, FAB } from 'react-native-paper';
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config';

const TransactionHomeScreen = ({ navigation }) => {
  const [state, setState] = useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;
  const [accountsData, setAccountsData] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'familyGroup', '26642'), (doc) => {
      setAccountsData(doc.data().accounts);
    });

    return () => {
      unsub();
    };
  }, []);

  const query = async () => {
    try {
      // await setDoc(doc(db, 'familyGroup', '24681'), {
      //   accounts: [
      //     {
      //       email: '',
      //       name: '',
      //       type: '',
      //       uid: '',
      //       transactions: [
      //         {
      //           amount: 10,
      //           date: '',
      //           description: '',
      //           category: {
      //             icon: '',
      //             id: 0,
      //             title: '',
      //             type: '',
      //           },
      //         },
      //       ],
      //     },
      //   ],
      // });
      const familyGroup = doc(db, 'familyGroup', '26642');
      // update element in array
      await updateDoc(familyGroup, {
        accounts2: arrayUnion({
          email: '',
          name: '',
          type: '',
          uid: '',
          transactions: [
            {
              amount: 10,
              date: '',
              description: '',
              category: {
                icon: '',
                id: 0,
                title: '',
                type: '',
              },
            },
          ],
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => query()}>
        {' '}
        Hello
      </Button>
    </View>

    // <View style={styles.container}>
    //   {accountsData?.map((data, index) => (
    //     <View key={index}>
    //       <Text> Name: {data.name}</Text>
    //       {/* <Text> Transaction: {data.transactions}</Text> */}
    //       {/* {console.log(
    //         data.transactions.map((transaction) => transaction.category.icon)
    //       )} */}
    //     </View>
    //   ))}
    //   {/* <FAB.Group
    //     open={open}
    //     visible
    //     icon={open ? 'close' : 'plus'}
    //     actions={[
    //       {
    //         icon: 'cash-plus',
    //         label: 'Income',
    //         onPress: () => navigation.navigate('TransactionScreen'),
    //       },
    //       {
    //         icon: 'cash-minus',
    //         label: 'Expense',
    //         onPress: () => console.log('Pressed expense'),
    //       },
    //       {
    //         icon: 'piggy-bank',
    //         label: 'Budget',
    //         onPress: () => console.log('Pressed budget'),
    //       },
    //     ]}
    //     onStateChange={onStateChange}
    //   /> */}
    // </View>
  );
};

export default TransactionHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 10,
  },
});
