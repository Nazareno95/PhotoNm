
import { Injectable } from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";
import * as firebase from 'firebase';
import { ToastController } from 'ionic-angular';
import 'rxjs/add/operator/map';
@Injectable()
export class CargaArchivoProvider {
  imagenes: ArchivoSubir[] = [];
  lastKey: string = null;
  constructor(public toastCtrl: ToastController,
              public afBD: AngularFireDatabase ) {

            this.cargar_ultimo_key()
            .subscribe(()=>{
                this.cargar_imagenes();
            })    
  }
  private cargar_ultimo_key(){
    return this.afBD.list('/post',
      ref => ref.orderByKey().limitToFirst(1) )
      .valueChanges()
      .map( (post:any) => {
        console.log(post);
        this.lastKey = post[0].key;
        this.imagenes.push(post [0]);
      })
  }
  cargar_imagenes(){
    return  new Promise ((resolve, reject) =>{
      this.afBD.list('/post', 
      ref =>.limitToLast(3)
            .orderByKey()
            .endAt(this.lastKey)
    ).valueChanges()
     .subscribe((posts:any)=>{
        if(posts.lenght == 0 ){
          console.log('ya no hay mas registro');
          resolve(false);
          return;
        }
        this.lastKey = posts[0].key;

        for (let i = posts.lenght-1; i>=0; i--){
            let post = posts[i];
            this.imagenes.push(post);
        }

     });
    });
  }

  cargar_imagen_firebase ( archivo:ArchivoSubir ){
    let promesa = new Promise((resolve, reject )=>{
        this.mostrar_toast('cargando...');

        let storeRef = firebase.storage().ref();
        let nombreArchivo:string = new Date().valueOf().toString();
        let uploadTask: firebase.storage.UploadTask =
            storeRef.child(`img/${nombreArchivo}`)
                    .putString( archivo.img, 'base64', {contentType: 'image/jpeg'})
            uploadTask.on( firebase.storage.TaskEvent.STATE_CHANGED, 
            ()=> { },
            ( error ) => {
              console.log("error en la carga");
              console.log(JSON.stringify(error));
              this.mostrar_toast(JSON.stringify(error));
              reject();
            },
            ()=> {
              console.log('archivo subido');
              this.mostrar_toast('imagen cargada correctamente');
                let url = uploadTask.snapshot.downloadURL;  
              this.crear_post( archivo.titulo, url, nombreArchivo);
              resolve();
            }
            )       
                  
    });
    return promesa;
  }
  private crear_post ( titulo:string ,url: string, nombreArchivo:string ){
    let post: ArchivoSubir = {
      img: url,
      titulo: titulo,
      key: nombreArchivo 
    };
    console.log (JSON.stringify(post));
    this.afBD.object(`/post/${nombreArchivo}`).update(post);
    this.imagenes.push( post );
  }


  mostrar_toast( mensaje: string){
    this.toastCtrl.create({
      message: mensaje,
      duration: 2000
    }).present();
  }
}
interface ArchivoSubir{
  titulo: string;
  img: string;
  key?: string;
}
