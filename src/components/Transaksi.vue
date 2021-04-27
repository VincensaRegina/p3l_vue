<template>
  <v-app>
    <v-main class="list">
      <h1><b>Transaksi</b></h1>
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
          <br />
          <br />
          <v-btn color="success" dark @click="dialogMeja = true">
            Tambah Transaksi
          </v-btn>
        </v-card-title>
        <v-data-table :headers="headers" :items="transaksi" :search="search">
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn small text @click="editItem(item)">
              <v-icon> mdi-pencil </v-icon>
            </v-btn>
            <v-btn small text @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>

      <!-- Dialog Transaksi -->
      <v-dialog
        v-model="dialogTransaksi"
        persistent
        max-width="600px"
        style="font-family: 'Montserrat', sans-serif"
      >
        <v-card>
          <v-card-title>
            <span style="font-family: 'Montserrat', sans-serif"
              >Detail Transaksi</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              Nama Customer: {{ editedItem.nama_customer }} <br />
              Email Customer: {{ editedItem.email }} <br />
              Telepon Customer: {{ editedItem.telp }} <br />
              Nomor Meja: {{ editedItem.no_meja }} <br />
              Waiter: {{ editedItem.waiter }}
              <br />
              <v-data-table :headers="headerPesanan" :items="detailTransaksi">
              </v-data-table>
              Subtotal : {{ editedItem.subtotal }} <br />
              Service 5% : {{ editedItem.service }} <br />
              Tax 10% : {{ editedItem.tax }} <br />
              Total : {{ editedItem.total }} <br />
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialogTransaksi = false">
              Cancel
            </v-btn>
            <v-btn
              color="green darken-1"
              text
              @click="
                dialogTransaksi = false;
                dialogBayar = true;
              "
            >
              Next
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog Bayar -->
      <v-dialog
        v-model="dialogBayar"
        persistent
        max-width="600px"
        style="font-family: 'Montserrat', sans-serif"
      >
        <v-card>
          <v-card-title>
            <span style="font-family: 'Montserrat', sans-serif"
              >Metode Pembayaran</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
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

              <v-form ref="form" v-model="valid" lazy-validation class="font">
                <v-select
                  v-model="editedItem.tipe_bayar"
                  label="Jenis Reservasi"
                  :items="['Cash', 'Kartu Debit', 'Kartu Kredit']"
                  required
                  @change="ubahJenisReservasi()"
                  :rules="[(v) => !!v || 'Tipe Bayar tidak boleh kosong!']"
                ></v-select>
                <div class="tabInput" v-if="editedItem.tipe_bayar != 'Cash'">
                  <v-btn
                    rounded
                    color="#F9DB6D"
                    small
                    @click="inputKartuType = 'Tambah'"
                  >
                    Tambah Data Kartu
                  </v-btn>
                  <v-btn
                    color="#F9DB6D"
                    rounded
                    small
                    style="position: relative; left: 10px"
                    @click="
                      inputKartuType = 'Cari';
                      readCustomer(null);
                    "
                  >
                    Pilih Data Kartu
                  </v-btn>
                </div>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="dialogBayar = false">
              Cancel
            </v-btn>
            <v-btn
              color="green darken-1"
              text
              @click="
                dialogTransaksi = false;
                dialogBayar = true;
              "
            >
              Next
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog Meja -->
      <v-dialog v-model="dialogMeja" max-width="700px">
        <v-card style="font-family: 'Montserrat', sans-serif; padding: 50px">
          <v-card-text class="font">
            <!-- primary/secondary itu transparansi tulisan -->
            <p
              class="font"
              style="font-size: 28px; font-weight: 600; color: #555d50"
            >
              Data Meja yang Terisi
            </p>
          </v-card-text>

          <v-container fluid>
            <v-layout row>
              <v-row>
                <v-col
                  v-for="(data, index) in mejaIsi"
                  :key="index"
                  max-width="344"
                  min-width="100px"
                  cols="3"
                  v-show="data.status == 'Isi'"
                >
                  <v-card
                    :color="getColor(data.status)"
                    style="padding-bottom: 20px"
                    @click="readReservasiBerdasarkanMeja(data)"
                    class="containerCard mx-auto"
                  >
                    <v-card-title style="color: white">{{
                      data.no_meja
                    }}</v-card-title>
                  </v-card>
                </v-col>
              </v-row>
            </v-layout>
          </v-container>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogConfirm" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title>
            <span>Peringatan!</span>
          </v-card-title>
          <v-card-text>
            Anda yakin ingin menghapus data transaksi?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="cancelDelete()">
              Cancel
            </v-btn>

            <v-btn color="red darken-1" text @click="deleteData">
              Delete
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
  name: "transaksi",
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },

  data() {
    return {
      validationErrors: "",
      search: null,
      //Untuk menentukan form tambah atau edit
      inputType: "Tambah",
      inputKartuType: "",
      //Untuk menentukan statusnya aktif/nonaktif
      statusType: "",
      //Id
      editedIndex: -1,
      editId: -1,
      //Dialog
      dialogTransaksi: false,
      dialogMeja: false,
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
          text: "No",
          align: "start",
          sortable: true,
          value: "no",
        },
        { text: "ID Reservasi", value: "id_reservasi" },
        { text: "ID Customer", value: "id_customer" },
        { text: "Nomor Transaksi", value: "no_transaksi" },
        { text: "Tanggal Bayar", value: "tgl_bayar" },
        { text: "Jam Bayar", value: "jam_bayar" },
        { text: "Tipe Bayar", value: "tipe_bayar" },
        { text: "Nomor Pemilik", value: "nama_kartu" },
        { text: "Kode EDC", value: "kode_edc" },
        { text: "Subtotal", value: "subtotal" },
        { text: "Total", value: "total" },
        { text: "Status", value: "status" },
        { text: "Action", value: "actions" },
      ],
      //Header
      headerPesanan: [
        {
          text: "No",
          align: "start",
          sortable: true,
          value: "no",
        },
        { text: "Nama Menu", value: "nama_menu" },
        { text: "Kuantitas", value: "qty" },
        { text: "Status", value: "status_pesanan" },
        { text: "Subtotal", value: "subtotal" },
      ],
      transaksi: [],
      editedItem: {
        id_reservasi: null,
        nama_customer: null,
        email: null,
        telp: null,
        no_meja: null,
        waiter: null,
        no_transaksi: null,
        tgl_bayar: new Date().toISOString().substr(0, 10),
        jam_bayar: null,
        tipe_bayar: null,
        nama_kartu: null,
        kode_edc: null,
        subtotal: null,
        service: null,
        tax: null,
        total: null,
      },
      //data meja yang terisi setelah klik tambah transaksi
      mejaIsi: null,
      //data reervasi, pesanan, dll yang didapat abis pilih meja
      detailTransaksi: null,
      //Form untuk save dan update
      formData: new FormData(),
    };
  },
  methods: {
    //read data product
    readData() {
      var url = this.$api + "/transaksi";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.transaksi = response.data.data;
        })
        .catch((error) => {
          console.log("GAGAL");
          console.log(error.response.data.message);
        });
    },
    readDataMeja() {
      var url = this.$api + "/meja";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.mejaIsi = response.data.data;
          console.log(this.mejaIsi);
          // this.dialogMeja = true;
        });
    },

    readIdKaryawan() {
      var url = this.$api + "/karyawan/" + localStorage.getItem("id");
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.editedItem.waiter = response.data.data.nama;
        })
        .catch((error) => {
          console.log("GAGAL");
          console.log(error.response.data.message);
        });
    },

    readReservasiBerdasarkanMeja(data) {
      let no_meja = data.no_meja;
      console.log(`Nomor meja yang dipilih: ${no_meja}`);
      var url = this.$api + "/reservasiOngoingMeja/" + no_meja;
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.detailTransaksi = response.data.data;
          console.log(this.detailTransaksi);
          //biar ga ulang2 this.detailTransaksi[0]
          const {
            nama_customer,
            email,
            telp,
            no_meja,
          } = this.detailTransaksi[0];
          this.editedItem.nama_customer = nama_customer; //entah kenapa tidak bisa langsung [0] di htmlnya. Jadi ditampung dulu.
          this.editedItem.email = email;
          this.editedItem.telp = telp;
          this.editedItem.no_meja = no_meja;

          //Hitung Subtotal sebelum tax
          for (let i = 0; i < this.detailTransaksi.length; i++) {
            this.editedItem.subtotal += parseInt(
              this.detailTransaksi[i].subtotal
            );
          }
          console.log(`Subtotal: ${this.editedItem.subtotal}`);

          //Hitung Service 5%
          this.editedItem.service = this.editedItem.subtotal * 0.05;
          //Hitung Tax 10%
          this.editedItem.tax = this.editedItem.subtotal * 0.1;
          //Hitung Total
          this.editedItem.total =
            this.editedItem.subtotal +
            this.editedItem.tax +
            this.editedItem.service;

          //Dialog tutup dan buka
          this.dialogMeja = false;
          this.dialogTransaksi = true;
        });
    },

    //untuk update status meja isi setelah print qr code -> status reservasi: ongoing -> status meja: isi
    updateReservasiStatus() {
      this.formData.append("status", "Ongoing");

      var url = this.$api + "/statusReservasi/" + this.afterQR.id_reservasi;
      this.$http
        .post(url, this.formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log(response.data.message);
          this.error_message = "Status reservasi menjadi Outgoing";
          this.color = "green";
          this.snackbar = true;
          this.readData(); //mengambil data
        })
        .catch((error) => {
          this.validationErrors = error.response.data.message;
        });
    },
    getColor(status) {
      if (status == "Kosong") return "#60A561";
      else if (status == "Isi") return "#D24848";
    },

    save() {
      if (this.$refs.form.validate()) {
        console.log("MASUK");
        this.formData.append("no_transaksi", this.editedItem.no_transaksi);
        this.formData.append(
          "jenis_transaksi",
          this.editedItem.jenis_transaksi
        );
        this.formData.append("nama_transaksi", this.editedItem.nama_transaksi);
        this.formData.append("tgl_kadaluarsa", this.editedItem.tgl_kadaluarsa);

        var url = this.$api + "/transaksi";
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
            this.readData(); //mengambil data
            this.resetForm();
            this.dialog = false;
          })
          .catch((error) => {
            console.log("GAGAL");
            this.validationErrors = error.response.data.message;
          });
      }
    },
    update() {
      if (this.editedItem.jenis_transaksi == "Debit") {
        console.log("MASUK KALO DEBIT");
        this.editedItem.nama_transaksi = "";
        this.editedItem.tgl_kadaluarsa = "";
      }
      this.formData.append("no_transaksi", this.editedItem.no_transaksi);
      this.formData.append("jenis_transaksi", this.editedItem.jenis_transaksi);
      this.formData.append("nama_transaksi", this.editedItem.nama_transaksi);
      this.formData.append("tgl_kadaluarsa", this.editedItem.tgl_kadaluarsa);

      var url = this.$api + "/transaksi/" + this.editId;
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
          this.readData(); //mengambil data
          this.dialog = false;
          this.resetForm();
          this.inputType = "Tambah";
        })
        .catch((error) => {
          this.validationErrors = error.response.data.message;
        });
    },

    resetForm() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.validationErrors = "";
    },

    cancel() {
      console.log("masuk cancel biasa");
      this.editedIndex = -1;
      this.dialog = false;
      this.resetForm();
      this.inputType = "Tambah";
    },

    cancelDelete() {
      console.log("masuk cancel");
      this.editedIndex = -1;
      this.dialogConfirm = false;
      this.inputType = "Tambah";
    },

    editItem(item) {
      this.inputType = "Ubah";
      this.editedIndex = item[".key"];
      this.editedItem = Object.assign({}, item); //copies all enumerable own properties from one or
      //more source objects to a target object. It returns the target object.
      this.editId = item.id;
      this.dialog = true;
    },
  },
  computed: {
    formTitle() {
      return this.editedIndex == -1 ? "Tambah Transaksi" : "Edit Transaksi";
    },
  },
  mounted() {
    this.readData();
    this.readDataMeja();
    this.readIdKaryawan();
  },
};
</script>
<style>
.list,
.font {
  font-family: "Montserrat", sans-serif !important;
}
.containerCard {
  display: flex;
  justify-content: center;
  align-items: center;
}
.tabInput {
  margin-left: 30px;
}
</style>