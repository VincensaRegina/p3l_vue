<template>
  <v-app>
    <v-main class="list">
      <h1>Menu</h1>
      <br />
      <v-card>
        <v-card-title>
          <v-text-field
            style="margin-top: -2vh"
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-data-table :headers="headers" :items="menu" :search="search">
          <template v-slot:[`item.serv_size`]="{ item }">
            {{ item.serv_size }} {{ item.unit_bahan }}
          </template>
          <template v-slot:[`item.harga`]="{ item }">
            Rp. {{ item.harga }}
          </template>
          <template v-slot:[`item.desc`]="{ item }">
            <v-btn
              small
              rounded
              color="#F9DB6D"
              style="color: #3b3b6b"
              @click="dialogDescShow(item)"
            >
              Buka
            </v-btn>
          </template>
          <template v-slot:[`item.gambar`]="{ item }">
            <v-btn
              rounded
              color="#F9DB6D"
              style="color: #3b3b6b"
              small
              @click="dialogGambarShow(item)"
            >
              Buka
            </v-btn>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="dialogDesc" max-width="500px">
        <v-card style="padding: 30px 15px">
          <v-card-text class="font">
            <div
              class="text--secondary"
              style="font-size: 15px; margin-bottom: 5px"
            >
              Deskripsi
            </div>
            <p
              class="font"
              style="font-size: 30px; font-weight: 600; color: black"
            >
              {{ namaTemp }}
            </p>
            <p></p>
            <v-divider></v-divider>
            <br />
            <div class="text--primary" style="font-size: 18px">
              {{ descTemp }}
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogGambar" max-width="400px">
        <v-card>
          <v-card-text class="font" style="padding-top:15px; margin-bottom:-15px">
            <div
              class="text--secondary"
              style="font-size: 15px; margin-bottom: 5px"
            >
              Gambar
            </div>
            <p
              class="font"
              style="font-size: 28px; font-weight: 600; color: black"
            >
              {{ namaTemp }}
            </p>
          </v-card-text>
          <v-img  :src="pictTemp" height="310"> </v-img>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>
        {{ error_message }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>


<script>
import Vue from "vue";
//import ValidationErrorsComp from './components/ValidationErrorsComp';
//Component untuk validasi
Vue.component("validation-errors", {
  data() {
    return {};
  },
  props: ["errors"],
  template: `<div v-if="validationErrors">
                  <ul class="alert alert-danger">
                      <li v-for="(value, key, index) in validationErrors">{{ value }}</li>
                  </ul>
              </div>`,
  computed: {
    validationErrors() {
      let errors = Object.values(this.errors); //membaca value dari array json
      errors = errors.flat(); // creates a new array with all sub-array elements concatenated into it recursively up to the specified depth
      return errors;
    },
  },
});

export default {
  name: "menuMakanan",
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },
  data() {
    return {
      validationErrors: "",
      search: null,
      //Untuk menentukan form tambah atau edit
      inputType: "Tambah",
      //Untuk menentukan statusnya aktif/nonaktif
      statusType: "",
      //Id
      editedIndex: -1,
      deleteId: -1,
      editId: -1,
      //Dialog
      dialog: false,
      dialogConfirm: false,
      dialogDesc: false,
      descTemp: null,
      dialogGambar: false,
      pictTemp: null,
      namaTemp: null,
      //Select untuk filter status
      statusSelect: null,
      //Form Validation
      valid: true,
      //Date Picker
      menuDate: false,
      //SnackBar
      snackbar: false,
      error_message: false,
      color: "",
      //Image
      imagePreview: null,
      showPreview: false,
      tempGambar: null,
      //Header
      headers: [
        {
          text: "No",
          align: "start",
          sortable: true,
          value: "no",
        },
        { text: "Nama Menu", value: "nama" },
        { text: "Deskripsi", value: "desc" },
        { text: "Unit", value: "unit" },
        { text: "Jenis", value: "jenis" },
        { text: "Nama Bahan", value: "nama_bahan" },
        { text: "Serving Size", value: "serv_size" },
        { text: "Harga", value: "harga" },
        { text: "Gambar", value: "gambar" },
      ],
      menu: [],
      editedItem: {
        id_bahan: null,
        nama: null,
        desc: null,
        unit: null,
        jenis: null,
        nama_bahan: null,
        serv_size: null,
        harga: null,
        gambar: null,
      },
      //Form untuk save dan update
      formData: new FormData(),
      //untuk data bahan yg di read untuk ambil nama bahan dan id
      bahan: [],
    };
  },
  methods: {
    dialogDescShow(item) {
      this.descTemp = item.desc;
      this.namaTemp = item.nama;
      this.dialogDesc = true;
    },
    dialogGambarShow(item) {
      console.log("dialog gambar", item.gambar);
      this.pictTemp = item.gambar;
      this.namaTemp = item.nama;
      this.dialogGambar = true;
    },
    //read data product
    readData() {
      var url = this.$api + "/menu";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.menu = response.data.data;
        });
    },

    onFileChange(event) {
      /*
    Set the local file variable to what the user has selected.
    */
      this.editedItem.gambar = event.target.files[0];
      console.log("di onfile change", this.editedItem.gambar);

      let reader = new FileReader();

      /*
    Add an event listener to the reader that when the file
    has been loaded, we flag the show preview as true and set the
    image to be what was read from the reader.
    */
      reader.addEventListener(
        "load",
        function () {
          this.showPreview = true;
          this.imagePreview = reader.result;
        }.bind(this),
        false
      );

      /*
    Check to see if the file is not empty.
    */
      if (this.editedItem.gambar) {
        /*
            Ensure the file is an image file.
        */
        if (/\.(jpe?g|png|gif)$/i.test(this.editedItem.gambar.name)) {
          console.log("loader", this.editedItem.gambar);
          /*
            Fire the readAsDataURL method which will read the file in and
            upon completion fire a 'load' event which we will listen to and
            display the image in the preview.
            */
          reader.readAsDataURL(this.editedItem.gambar);
        }
      }
    },
  },
  mounted() {
    this.readData();
  },
};
</script>
<style>
.list,
.font {
  font-family: "Montserrat", sans-serif !important;
}

.imgDialog {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
