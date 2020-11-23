import {StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import React from "react";
import Inscription from "./Inscription";
import MotDePasseOublie from "./MotDePasseOublie"
import AsyncStorage from '@react-native-community/async-storage';
import axios from "axios";

class Connection extends React.Component {

  constructor(props) {
    super(props);
    this.mail = "";
    this.password = "";
    this.state={
      errorMessage: ""
    }
  }

  /* 
  Fonction permettant de récupérer les 3 portes les plus utilisées par l'utilisateur
  @params: id => identifiant de l'utilisateur dont on souhaite récuperer les valeurs.
  */
  getHistory = (id) => {
    let doors = [];
    axios.get('http://localhost:8081/doorHistory/user/'+id)
      .then(res => {
        for(let i = 0; i<res.data.length; i ++) {
          doors[i] = parseInt(res.data[i].door);
        }
        AsyncStorage.setItem('user', id);
        AsyncStorage.setItem('doors', doors);
        this.redirect(); 
      })
  };

  redirect () {
    this.props.navigation.navigate('Afficher la liste de vos portes');
}

  checkUser(){
    if(this.password.length > 0 && this.mail.length > 0){
    axios.post('http://localhost:8081/userConnection/', {user : { 
        mail: this.mail,
        password : this.password
      }
    })
      .then((response) => {
        if (response.data != false) {
          this.getHistory(response.data);
        } else {
          this.setState({errorMessage:'Mail ou mot de passe incorrect'});
        }
      })
    } else {
      this.setState({errorMessage:'Veuillez renseigner une valeur dans chaque champ'});
    }
  }

  render() {
    const nav = this.props.navigation;
    return (
      <View style={styles.component}>
        <Text style={styles.text}>E-mail : </Text>
        <TextInput placeholder='E-mail' style={styles.input} onChangeText={(text)=> this.mail = text}/>
        <Text style={styles.text}>Mot de passe : </Text>
        <TextInput placeholder='Mot de passe' secureTextEntry={true} style={styles.input} onChangeText={(text)=> this.password = text }/>
        <Text style={styles.error}>{this.state.errorMessage}</Text>
        <TouchableOpacity style={styles.connect} onPress={()=> this.checkUser()}>
          <Text style={styles.textConnection}>Connexion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inscript} onPress={() => nav.navigate("Inscription")} >
          <Text style={styles.text}>Pas encore de compte ? </Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.text} onPress={() => nav.navigate("MotDePasseOublie")}>
          <Text style={styles.text}> mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  component: {
    justifyContent: 'center',
    alignContent: 'center',
    margin: 75,
    marginTop: 100
  },
  text: {
    padding: 5,
    justifyContent: 'center',
    alignContent: 'center'
  },
  input: {
    padding: 5,
    justifyContent: 'center',
    alignContent: 'center',
    borderColor: '#000',
    borderWidth: 1,
  },
  connect: {
    color: 'white',
    textAlign: 'center',
    margin: 50,
    padding: 10,
    backgroundColor: '#719ada',
    justifyContent: 'center',
    alignContent: 'center',
  },
  textConnection: {
    color: 'white',
    textAlign: 'center'
  },
  inscript: {
    textAlign: 'center',
    margin: 50,
    padding: 10,
    backgroundColor: '#d8d8d8',
    justifyContent: 'center',
    alignContent: 'center'
  },
  password: {
    textAlign: 'right',
  },
  error: {
    color : 'red',
    textAlign: 'center',
    paddingTop: 5
  }
});

export default Connection;
