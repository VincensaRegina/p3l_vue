<template>
  <v-app>
    <v-main class="list">
      <v-container>
        <h1>
          <b>{{ inputType }} Menu</b>
        </h1>
        <validation-errors
          :errors="validationErrors"
          v-if="validationErrors"
          style="
            background-color: #d24848;
            padding: 10px;
            color: white;
            border-radius: 10px;
          "
        ></validation-errors>
        <br />
        <v-form ref="form" v-model="valid" lazy-validation class="font">
          <v-text-field
            v-model="editedItem.nama"
            label="Nama Menu"
            :rules="[(v) => !!v || 'Nama Menu tidak boleh kosong!']"
            required
          ></v-text-field>
          <v-textarea
            v-model="editedItem.desc"
            label="Deskripsi"
            required
            :rules="[(v) => !!v || 'Deskripsi tidak boleh kosong!']"
          ></v-textarea>
          <v-text-field
            v-model="editedItem.unit"
            label="Unit"
            required
            :rules="[(v) => !!v || 'Unit tidak boleh kosong!']"
          ></v-text-field>
          <v-select
            v-model="editedItem.jenis"
            :items="['Makanan Utama', 'Makanan Side Dish', 'Minuman']"
            label="Jenis Makanan"
          >
          </v-select>
          <v-row>
            <v-col cols="2" sm="6">
              <v-autocomplete
                v-model="editedItem.nama_bahan"
                :items="bahan"
                label="Nama Bahan"
                @change="readIdBahanToUnit"
              >
              </v-autocomplete>
            </v-col>
            <v-col>
              <v-text-field
                v-model="editedItem.serv_size"
                label="Serving Size"
                required
                type="number"
                v-show="editedItem.nama_bahan"
                :suffix="unitBahan"
                :rules="[(v) => !!v || 'Serving size tidak boleh kosong!']"
              ></v-text-field>
            </v-col>
          </v-row>

          <vuetify-money
            v-model="editedItem.harga"
            v-bind:options="options"
            v-bind:label="label"
            :rules="[(v) => !!v || 'Harga tidak boleh kosong!']"
          />

          <br />
          <p>
            Gambar
            <br />
            <img :src="imagePreview" width="200" v-show="showPreview" />
            <br />
            <input
              type="file"
              name="gambar"
              class="form-control-file"
              id="gambar"
              required
              accept=".jpg, .png, .jpeg"
              :rules="[(v) => !!v || 'Gambar is required']"
              @change="onFileChange"
            />
          </p>
          <br />
        </v-form>
        <div style="float: right">
          <v-btn color="red darken-1" text @click="moveToMenu"> Cancel </v-btn>
          <v-btn color="green darken-1" text @click="setForm"> Save </v-btn>
        </div>
      </v-container>

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
  props: ["inputType", "editedIndex", "editId", "item"],
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },
  data() {
    return {
      validationErrors: "",
      search: null,
      //Untuk menentukan statusnya aktif/nonaktif
      statusType: "",
      //Id
      deleteId: -1,
      //Dialog
      dialog: false,
      dialogConfirm: false,
      dialogDesc: false,
      descTemp: null,
      dialogGambar: false,
      pictTemp: null,
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
        { text: "Action", value: "actions" },
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
      options: {
        locale: "pt-BR",
        prefix: "Rp",
        suffix: "",
        length: 10,
        precision: 0,
      },
      label: "Harga",
      //Form untuk save dan update
      formData: new FormData(),
      //untuk data bahan yg di read untuk ambil nama bahan dan id
      bahan: [],
      unitBahan: "",
    };
  },
  methods: {
    moveToMenu() {
      this.$router.push("/om/menu");
    },
    dialogDescShow(item) {
      this.descTemp = item.desc;
      this.dialogDesc = true;
    },
    dialogGambarShow(item) {
      console.log("dialog gambar", item.gambar);
      this.pictTemp = item.gambar;
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
    //read bahan untuk isi bahan saat input menu
    readBahan(item) {
      var url = this.$api + "/bahan";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.bahan = [];
          var dataBahan = response.data.data;
          for (var i = 0; i < dataBahan.length; i++) {
            this.bahan.push(dataBahan[i].id + " - " + dataBahan[i].nama_bahan);
          }

          if (this.inputType == "Ubah") {
            //untuk auto ke isi sesuai data saat mau update
            this.editedItem.nama_bahan =
              item.id_bahan + " - " + item.nama_bahan;
            this.readIdBahanToUnit();
          }
        });
    },

    readIdBahanToUnit() {
      //untuk ambil id bahan dari concat id-nama bahan di v-autocomplete
      console.log("nama bahan", this.editedItem.nama_bahan);
      var bahanConcat = this.editedItem.nama_bahan; //ditampung dulu, karena kalo langsung entah kenapa error
      var id_bahan = bahanConcat.substring(0, bahanConcat.indexOf(" -"));
      this.editedItem.id_bahan = id_bahan;
      this.readIdBahan(this.editedItem.id_bahan);
    },
    //read id bahan untuk baca unit bahan utk suffix serv size
    readIdBahan(id) {
      var url = this.$api + "/bahan/" + id;
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log("response", response.data.data);
          this.unitBahan = response.data.data.unit;
        });
    },
    setForm() {
      if (this.inputType === "Tambah") {
        this.save();
      } else {
        this.update();
      }
    },
    save() {
      if (this.$refs.form.validate()) {
        //untuk ambil id bahan dari concat id-nama bahan di v-autocomplete
        var bahanConcat = this.editedItem.nama_bahan; //ditampung dulu, karena kalo langsung entah kenapa error
        var id_bahan = bahanConcat.substring(0, bahanConcat.indexOf(" -"));
        this.editedItem.id_bahan = id_bahan;
        console.log("id bahan", this.editedItem.id_bahan);

        this.formData.append("nama", this.editedItem.nama);
        this.formData.append("id_bahan", this.editedItem.id_bahan);
        this.formData.append("desc", this.editedItem.desc);
        this.formData.append("unit", this.editedItem.unit);
        this.formData.append("jenis", this.editedItem.jenis);
        this.formData.append("serv_size", this.editedItem.serv_size);
        this.formData.append("harga", this.editedItem.harga);
        this.formData.append("gambar", this.editedItem.gambar);

        var url = this.$api + "/menu";
        this.valid = true;
        this.$http
          .post(url, this.formData, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
          .then((response) => {
            console.log("SUKSES");
            this.error_message = response.data.message;
            this.color = "green";
            this.snackbar = true;
            window.setTimeout(this.moveToMenu, 700);
          })
          .catch((error) => {
            console.log("GAGAL");
            this.validationErrors = error.response.data.message;
            window.scroll({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          });
      }
    },
    update() {
      if (typeof this.editedItem.gambar === "string") {
        this.editedItem.gambar = null;
        console.log("masuk di update", this.editedItem.picture);
      } else {
        console.log("masuk di update else", this.editedItem.picture);
      }
      //untuk ambil id bahan dari concat id-nama bahan di v-autocomplete
      var bahanConcat = this.editedItem.nama_bahan; //ditampung dulu, karena kalo langsung entah kenapa error
      var id_bahan = bahanConcat.substring(0, bahanConcat.indexOf(" -"));
      this.editedItem.id_bahan = id_bahan;
      console.log("id bahan", this.editedItem.id_bahan);

      this.formData.append("nama", this.editedItem.nama);
      this.formData.append("id_bahan", this.editedItem.id_bahan);
      this.formData.append("desc", this.editedItem.desc);
      this.formData.append("unit", this.editedItem.unit);
      this.formData.append("jenis", this.editedItem.jenis);
      this.formData.append("serv_size", this.editedItem.serv_size);
      this.formData.append("harga", this.editedItem.harga);
      this.formData.append("gambar", this.editedItem.gambar);

      var url = this.$api + "/menu/" + this.editId;
      this.$http
        .post(url, this.formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.error_message = response.data.message;
          this.color = "green";
          this.snackbar = true;
          window.setTimeout(this.moveToMenu, 700);
        })
        .catch((error) => {
          this.validationErrors = error.response.data.message;
          window.scrollTo(0, 0);
        });
    },

    editItem() {
      this.editedItem = Object.assign({}, this.item); //copies all enumerable own properties from one or
      //more source objects to a target object. It returns the target object.
      this.readBahan(this.item);

      //munculin gambar di dialog edit menu
      if (this.editedItem.gambar != null) {
        console.log(typeof this.editedItem.gambar);
        this.tempGambar = this.editedItem.gambar;
        this.showPreview = true;
        this.imagePreview = this.tempGambar;
      }
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
  computed: {
    formTitle() {
      return this.editedIndex == -1 ? "Tambah Menu" : "Edit Menu";
    },
  },
  created() {
    this.editItem();
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

/* Chrome, Safari, Edge, Opera */
/* ngilangin panah atas bawah di input number */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>