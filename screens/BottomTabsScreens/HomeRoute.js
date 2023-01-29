import { useContext, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Appbar, Button } from 'react-native-paper';
import { AuthContext } from '../../Helper/Context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';
export const HomeRoute = () => {
  const { currentUser } = useContext(AuthContext);
  const search = async () => {
    const docRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data().name);
    } else {
      // doc.data() will be undefined in this case
      console.log('No such document!');
    }
  };
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="SmartSpend" />
      </Appbar.Header>
      <View>
        <Text>HomeRoute</Text>
        <Text>{currentUser ? currentUser.email : null}</Text>
        <Button
          mode="text"
          onPress={() => {
            search();
          }}
        >
          Search
        </Button>
      </View>
    </>
  );
};
