<template>
  <v-app>
    <v-main class="list">
      <h1><b>Pesanan</b></h1>
      <br />
      <v-card>
        <v-toolbar class="gradienMerah" dark flat>
          <v-tabs v-model="tabs" centered slider-color="yellow" fixed-tabs>
            <v-tab href="#tab-1"> Ongoing </v-tab>

            <v-tab href="#tab-2"> Riwayat </v-tab>
          </v-tabs>
        </v-toolbar>
        <v-tabs-items v-model="tabs">
          <!-- untuk tab pesanan yang ongoing -->
          <v-tab-item :value="'tab-1'">
            <v-card>
              <v-card-title>
                <br />
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
              <v-data-table
                :headers="headers"
                :items="pesananOngoing"
                :search="search"
                groupable
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    small
                    @click="
                      jenisUpdate = 'Not Ready';
                      editItem(item);
                    "
                    v-show="item.status != 'Not Ready'"
                    color="#F9DB6D"
                  >
                    Not Ready
                  </v-btn>
                  <v-btn
                    small
                    @click="
                      jenisUpdate = 'Ready';
                      editItem(item);
                    "
                    v-show="item.status != 'Ready'"
                    color="#F9DB6D"
                    style="margin-left: 10px"
                  >
                    Ready
                  </v-btn>
                  <v-btn
                    small
                    @click="
                      jenisUpdate = 'Served';
                      editItem(item);
                    "
                    v-show="item.status != 'Served'"
                    color="#F9DB6D"
                    style="margin-left: 10px"
                  >
                    Served
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-tab-item>
          <!-- untuk tab riwayat pesanan -->
          <v-tab-item :value="'tab-2'">
            <v-card>
              <v-card-title>
                <br />
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
              <v-data-table
                :headers="headersRiwayat"
                :items="pesananRiwayat"
                :search="search"
                groupable
              >
              </v-data-table>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card>

       <v-dialog v-model="dialogConfirm" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title>
            <span>Peringatan!</span>
          </v-card-title>
          <v-card-text>
            Anda yakin ingin mengganti status pesanan?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialogConfirm = false">
              Cancel
            </v-btn>

            <v-btn color="green darken-1" text @click="updateStatusPesanan()">
              Update
            </v-btn>
          </v-card-actions>
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
  name: "pesananOM",
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },
  data() {
    return {
      //untuk tab
      tabs: null,
      //ready, served, atau not ready
      jenisUpdate: "",
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
      //Header
      headers: [
        {
          text: "ID",
          align: "start",
          sortable: true,
          value: "id",
        },
        { text: "ID Reservasi", value: "id_reservasi" },
        { text: "Nomor Meja", value: "Nomor Meja" },
        { text: "Nama Menu", value: "nama_menu" },
        { text: "Kuantitas", value: "qty" },
        { text: "Subtotal", value: "subtotal" },
        { text: "Status", value: "status" },
        { text: "Action", value: "actions" },
      ],
      headersRiwayat: [
        {
          text: "ID",
          align: "start",
          sortable: true,
          value: "id",
        },
        { text: "ID Reservasi", value: "id_reservasi" },
        { text: "Nomor Meja", value: "Nomor Meja" },
        { text: "Nama Menu", value: "nama_menu" },
        { text: "Kuantitas", value: "qty" },
        { text: "Subtotal", value: "subtotal" },
        { text: "Status", value: "status" },
      ],
      //read data
      pesananOngoing: [],
      pesananRiwayat: [],
      editedItem: {
        no_pesanan: null,
        jenis_pesanan: null,
        nama_pesanan: null,
        tgl_kadaluarsa: null,
      },
      //Form untuk save dan update
      formData: new FormData(),
    };
  },
  methods: {
    //read data product
    readPesananOngoing() {
      var url = this.$api + "/pesananOngoing";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.pesananOngoing = response.data.data;
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },
    //read data product
    readPesananRiwayat() {
      var url = this.$api + "/pesananRiwayat";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.pesananRiwayat = response.data.data;
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },
    setForm() {
      if (this.inputType === "Tambah") {
        this.save();
      } else {
        this.update();
      }
    },

    updateStatusPesanan() {
      if (this.jenisUpdate == "Ready")  this.formData.append("status", "Ready");
      else if (this.jenisUpdate == "Served")  this.formData.append("status", "Served");
      else if (this.jenisUpdate == "Not Ready")  this.formData.append("status", "Not Ready");

      var url = this.$api + "/statusPesanan/" + this.editId;
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
          this.readPesananOngoing(); //mengambil data
          this.dialogConfirm = false;
        })
        .catch((error) => {
          this.error_message = error.response.data.message;
        });
    },

    editItem(item) {
      this.editedIndex = item[".key"];
      this.editedItem = Object.assign({}, item); //copies all enumerable own properties from one or
      //more source objects to a target object. It returns the target object.
      this.editId = item.id;
      this.dialogConfirm = true;
    },
  },

  mounted() {
    this.readPesananOngoing();
    this.readPesananRiwayat();
  },
};
</script>
<style>
.list,
.font {
  font-family: "Montserrat", sans-serif !important;
}
</style>