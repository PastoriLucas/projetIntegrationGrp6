import {StyleSheet, View} from 'react-native';
import React from 'react';

const Historique = ({navigation}) => {
    return (
      <View style={styles.container}>
          Historique des portes
      </View>
    );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
})

export default Historique;
