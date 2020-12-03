import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableHighlight} from "react-native";
import axios from "axios";
import Modal from "modal-react-native-web";
import {Snackbar} from 'react-native-paper';
import { _verifyMail, _verifyconfirm, _verifyname, _verifyPassword, _verifyPhone, _reset} from '../Functions/functionsInscription'


class MonCompte extends React.Component {

    constructor(props){
        super(props)
        this.state={
            isLoading: true,
            user: [],
            visible1: false,
            visible2: false,
            newInfos:[],
            mailVerified : false,
            error : "",
            modifBoolean : false,
            pass : {}
        };
    }

    getUser () {
        let user = 1;
        AsyncStorage.getItem('user', function(errs, result) {
            if (!errs) {
                if (result !== null) {
                    user = result
                }
                else {
                    //alert(errs)
                }
            }
        })
        axios.get('http://82.165.248.136:8081/user/' + user)
            .then(res => {
                this.setState({
                    isLoading:false,
                    user: res.data,
                    newInfos:[res.data[0].lastname, res.data[0].firstname, res.data[0].sexe, res.data[0].mail, res.data[0].phone]
                })
            })

            .catch(error => {
                console.log(error)
            })
    }

    async getMail(mail){
        if(mail != this.state.user[0].mail) {
            let user = {
                mail : mail
            };
            await axios.post('http://82.165.248.136:8081/userMail/', {user})
            .then(res => {
                const verif = res.data;
                if (verif) {
                    this.setState({
                        mailVerified: true,
                        error : ""
                    });
                }
                else{
                    this.setState({error : "Vous possédez déjà un compte avec cette adresse mail"});
                    this.setState({
                        mailVerified: false
                    });
                    console.log(this.state.error)
                }
            });
        }
        else {
            this.setState({mailVerified: true})
        }
        this.submit()
    }

    changePassword() {
        let user ={
            old : this.state.pass.old,
            id : this.state.user[0].id
        };
        axios.post('http://localhost:8081/verifyPassword/', {user})
            .then(res => {
                const verif = res.data;
                if (verif) {
                    console.log("l'ancien mot de passe est bon")
                    if (_verifyPassword(this.state.pass.new).state){
                        if(_verifyconfirm(this.state.pass.confirm, this.state.pass.new).state){
                            user ={
                                new : this.state.pass.new,
                                id : this.state.user[0].id
                            };
                            axios.put('http://localhost:8081/changePassword/', {user})

                        }
                        else{
                            console.log(_verifyconfirm(this.state.pass.new, this.state.pass.confirm).msg)
                        }
                    }
                else {
                    console.log(_verifyPassword(this.state.pass.new).msg)
                    }
                    /* axios.post('http://82.165.248.136:8081/verifyPassword/', {old})
                        .then(res => {

                        })*/
                }
                else {
                    this.setState({error : "l'ancien mot de passe indiqué n'est pas bon"});
                    console.log("l'ancien mot de passe indiqué n'est pas bon")
                }
            })


    }

    componentDidMount() {
        AsyncStorage.getItem('user').then((result) => {
          this.setState({user : result});
          console.log(this.state.user);
          if(this.state.user == null) {
            this.props.navigation.navigate('Connexion', {inscriptionSubmitted: false})
          }
        })
    }

    submit(){
        if (_verifyname(this.state.newInfos[1], this.state.newInfos[0]).state){
           if (_verifyPhone(this.state.newInfos[4]).state){
               if (_verifyMail(this.state.newInfos[3]).state){
                   if (this.state.newInfos[2] == "M" || this.state.newInfos[2] == "F") {
                        if (this.state.mailVerified){
                            let id = this.state.user[0].id;
                            console.log(id);
                            this.send(this.state.newInfos[1], this.state.newInfos[0], this.state.newInfos[4], this.state.newInfos[2], this.state.newInfos[3], id);
                            this.setState({newInfos : []});
                            this.setState({user : [{ lastname : this.state.newInfos[0], firstname : this.state.newInfos[1], sexe : this.state.newInfos[2], mail : this.state.newInfos[3], phone :this.state.newInfos[4]}]})
                            alert('modif faite')
                        }
                    }
                    else {
                        console.log('Erreur sexe')
                    }
                }
                else {
                    this.setState({error : _verifyMail(this.mail).msg});
                    console.log('Erreur mail')
                }
            }
            else {
                this.setState({error : _verifyPhone(this.phone).msg});
                console.log('Erreur phone')
            }
        }
        else {
            this.setState({error : _verifyname(this.firstname, this.name).msg});
            console.log('Erreur nom prenom')
        }
    };

    send(firstname, name, phone, gender, mail, id) {
        const user = {
            firstname : firstname,
            name:  name,
            phone : phone,
            gender : gender,
            mail : mail,
            id : id
        };


        axios.put('http://localhost:8081/modifUsers',{user})
            .then(() => {
                this.setState({modifBoolean : true})
            })
            .catch(err => console.log(err));


    }

    render(){
        if(this.state.isLoading) {
            this.getUser()
            return <Text>Loading...</Text>
        }
        else {
            return (
                <View style={styles.container}>
                    <Text style={styles.text}>Nom :</Text>
                    <Text style={styles.textUt}>{this.state.user[0].lastname}</Text>
                    <Text style={styles.text}>Prénom :</Text>
                    <Text style={styles.textUt}>{this.state.user[0].firstname}</Text>
                    <Text style={styles.text}>Sexe :</Text>
                    <Text style={styles.textUt}>{this.state.user[0].sexe}</Text>
                    <Text style={styles.text}>Mail :</Text>
                    <Text style={styles.textUt}>{this.state.user[0].mail}</Text>
                    <Text style={styles.text}>Téléphone :</Text>
                    <Text style={styles.textUt}>{this.state.user[0].phone}</Text>
                    <View style={{flex: 6}}>
                        <TouchableHighlight style={styles.editButton}
                            onPress={() => this.setState({visible1: true})}>
                            <View>
                                <Text style={{fontSize: 15, color :"#ffffff"}}>Modifier</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.visible1}
                    ariaHideApp={false}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text>Modification infos</Text>
                                <Text style={{fontSize: 15}}>Nom de famille: </Text>
                                <TextInput ref={input => { this.textInput0 = input }} placeholder={this.state.user[0].lastname} style={styles.input} onChangeText={(text)=> this.state.newInfos[0]= text} defaultValue={this.state.user[0].lastname}/>
                                <Text style={{fontSize: 15}}>Prénom : </Text>
                                <TextInput ref={input => { this.textInput1 = input }} placeholder={this.state.user[0].firstname} style={styles.input} onChangeText={(text)=> this.state.newInfos[1]= text} defaultValue={this.state.user[0].firstname}/>
                                <Text style={{fontSize: 15}}>Sexe : </Text>
                                <TextInput ref={input => { this.textInput2 = input }} placeholder={this.state.user[0].sexe} style={styles.input} onChangeText={(text)=> this.state.newInfos[2]= text} defaultValue={this.state.user[0].sexe}/>
                                <Text style={{fontSize: 15}}>Mail : </Text>
                                <TextInput ref={input => { this.textInput3 = input }} placeholder={this.state.user[0].mail} style={styles.input} onChangeText={(text)=> this.state.newInfos[3]= text} defaultValue={this.state.user[0].mail}/>
                                <Text style={{fontSize: 15}}>Téléphone : </Text>
                                <TextInput ref={input => { this.textInput4 = input }} placeholder={this.state.user[0].phone} style={styles.input} onChangeText={(text)=> this.state.newInfos[4]= text} defaultValue={this.state.user[0].phone}/>
                                <View style={{flex: 6}}>
                                    <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={() => {
                                        this.getMail(this.state.newInfos[3])
                                    }}
                                    >
                                        <Text style={{fontSize: 20, color: "white"}}>Sauver </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                    style={styles.returnButton}
                                    onPress={() => {
                                        this.textInput0.value = this.state.user[0].lastname
                                        this.textInput1.value = this.state.user[0].firstname
                                        this.textInput2.value = this.state.user[0].sexe
                                        this.textInput3.value = this.state.user[0].mail
                                        this.textInput4.value = this.state.user[0].phone
                                        this.setState({visible1: false, newInfos: []})
                                    }}
                                    >
                                        <Text style={{fontSize: 20}}>Annuler </Text>
                                    </TouchableOpacity>


                                </View>
                                <Snackbar
                                    visible={false}
                                    onDismiss={() => console.log('ok')}
                                    style = {styles.fail}
                                    duration={2000}
                                >
                                    {'ouke'}
                                </Snackbar>
                            </View>
                        </View>
                    </Modal>
                    <View style={{flex: 6}}>
                        <TouchableHighlight style={styles.editButton}
                                            onPress={() => this.setState({visible2: true})}>
                            <View>
                                <Text style={{fontSize: 15, color :"#ffffff"}}>Nouveau mot de passe</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.visible2}
                        ariaHideApp={false}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text>Modification infos</Text>
                                <Text style={{fontSize: 15}}>Mot de passe actuel: </Text>
                                <TextInput ref={input => { this.textInput5 = input }} style={styles.input} onChangeText={(text)=> this.state.pass.old= text}/>
                                <Text style={{fontSize: 15}}>Nouveau mot de passe : </Text>
                                <TextInput ref={input => { this.textInput6 = input }} style={styles.input} onChangeText={(text)=> this.state.pass.new= text}/>
                                <Text style={{fontSize: 15}}>Confirmation nouveau mot de passe : </Text>
                                <TextInput ref={input => { this.textInput7 = input }} style={styles.input} onChangeText={(text)=> this.state.pass.confirm= text}/>
                                <View style={{flex: 6}}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => {
                                            this.changePassword()
                                        }}
                                    >
                                        <Text style={{fontSize: 20, color: "white"}}>Confirmer </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.returnButton}
                                        onPress={() => {
                                            this.setState({visible2: false, newInfos: []})
                                        }}
                                    >
                                        <Text style={{fontSize: 20}}>Annuler </Text>
                                    </TouchableOpacity>


                                </View>
                                <Snackbar
                                    visible={false}
                                    onDismiss={() => console.log('ok')}
                                    style = {styles.fail}
                                    duration={2000}
                                >
                                    {'ouke'}
                                </Snackbar>
                            </View>
                        </View>
                    </Modal>
                </View>
            )
        }
    }
};
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignContent: 'center',
        marginLeft: 60,
        marginRight: 60,
        marginTop: 20,
        marginBottom:20
    },
    text: {
        paddingVertical: 5,
        justifyContent: 'center',
        alignContent: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        color : '#719ada',
    },

    textUt: {
        padding: 5,
        justifyContent: 'center',
        alignContent: 'center',
        borderColor: '#000000',
        borderWidth: 1,
        fontSize: 15,
    },
    saveButton: {
        flex:1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: "#719ada",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 25,
        marginBottom: 15,
        padding: 5,
    },
    editButton: {
        flex:1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: "#719ada",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        marginBottom: 15,
        padding: 22,
    },
    input: {
        padding: 5,
        justifyContent: 'center',
        alignContent: 'center',
        borderColor: '#000',
        borderWidth: 1,
        fontFamily: 'Consolas'
    },
    textStyleSave: {
        flex:1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: "#719ada",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        marginBottom: 15
    },
    returnButton: {
        flex:1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: "#d0d0d0",
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        marginBottom: 15,
        padding: 5,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    success : {
        backgroundColor : "green"
    },
    fail : {
        backgroundColor : "red"
    }
});
export default MonCompte;
