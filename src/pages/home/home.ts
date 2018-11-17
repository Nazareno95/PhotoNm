import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { SubirPage } from '../subir/subir';
import { CargaArchivoProvider } from "../../providers/carga-archivo/carga-archivo";
import {SocialSharing} from '@ionic-native/social-sharing';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  hayMas: Boolean =  true;
  constructor(private modalCtrl:ModalController, 
              private _cap: CargaArchivoProvider,
              private socialSharing: SocialSharing) {
    
  }

  mostrar_modal(){
  	let modal = this.modalCtrl.create( SubirPage );
  	modal.present();
  }

  doInfinite(infiniteScroll){
    console.log('begin async');
    this._cap.cargar_imagenes().then(
      ( hayMas:boolean) =>{
        console.log(hayMas);
        this.hayMas = hayMas;
      infiniteScroll.complete();
    }
  };

    compartit(post:any){
      this.socialSharing.shareViaFacebook( post.titulo, post.img, post.img)
        .then (()=> {} )
        .catch(()=>{} )
    }
  }
}
