import { ToastrService } from 'ngx-toastr';
import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { Lightbox } from 'ngx-lightbox';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    window.history.back()
  }
  products: Array<any> = [];
  search: string = '';
  constructor(private userService: UserService, private lightbox: Lightbox, private toastr: ToastrService, public translate: TranslateService) {
  }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.userService.getProducts().subscribe(res => {
      if (res) {
        this.products = res?.data;
        this.products = this.products.sort((a,b) => {
          return a.product_number - b.product_number;
        })
        this.products.forEach((item: any) => {
          item.quantity = 0;
        })

        this.getUserCart();
      }
    })
  }

  updateAddCart(product: any, type: any): void {
    if (type == 'add') {
      product.quantity = product.quantity + 1;
    } else if(type == 'add_to_cart'){
      if(product.quantity == 0){
        product.quantity = 1;
      }
    }else {
      if(product.quantity > 0){
        product.quantity = product.quantity - 1;
      }else{
        return;
      }
    }
    this.products.forEach(prod => {
      if (prod._id == product._id) {
        prod.quantity = product.quantity
      }
    })

    let cart = this.products.filter(prd => {
      if (prd.quantity > 0) {
        return prd;
      }
    })

    this.userService.updateAddCart({products: cart}).subscribe(res => {
      this.getUserCart();
      // debugger;
      
      if(this.translate.currentLang == 'fr'){
        this.toastr.success('Le produit a été ajouté à votre panier')
      } else{
        this.toastr.success('The product has been added to your cart')
      }

    })
  }

  getUserCart(): void {
    this.userService.getUserCart().subscribe(res => {
      if (res.userCart) {
        this.products.forEach(product => {
          res.userCart.products.forEach((cartProduct: any) => {
            if (cartProduct._id == product._id) {
              product.quantity = cartProduct.quantity;
            }
          });
        })
      }
    })
  }

  onImageClick(product: any): void {
    const src = product.imageUrl
    const caption = product.product_name;
    const album = {
       src: src,
       caption: caption,
       thumb: src
    };

    this.lightbox.open([album], 0);
  }

}
