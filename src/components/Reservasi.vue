<template>
  <v-app>
    <v-main class="list marginAll">
      <h1><b>Reservasi</b></h1>
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

          <v-select
            v-model="statusSelect"
            :items="['Semua', 'Not Started', 'Ongoing', 'Finished']"
            label="Filter Status"
          ></v-select>
          <v-spacer></v-spacer>
          <v-btn color="#60A561" dark @click="moveToForm()">
            Tambah Reservasi
          </v-btn>
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :search="search"
          :sort-by.sync="sortBy"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              small
              text
              @click="
                isiQRCode(item);
                dialogQrCode = true;
              "
            >
              <v-icon> mdi-qrcode-scan </v-icon>
            </v-btn>
            <v-btn small text @click="editItem(item)">
              <v-icon> mdi-pencil </v-icon>
            </v-btn>

            <v-btn
              small
              text
              @click="deleteItem(item)"
              v-if="item.status != 'Finished' && item.status != 'Ongoing'"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="dialogConfirm" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title>
            <span>Peringatan!</span>
          </v-card-title>
          <v-card-text>
            Anda yakin ingin menghapus data reservasi?
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

      <v-dialog v-model="dialogQrCode" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif" class="parent">
          <v-card-title>
            <span>QR Code</span>
          </v-card-title>
          <v-card-text class="child">
            <qrcode-vue :value="value" :size="size" level="H" />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialogQrCode = false">
              Cancel
            </v-btn>

            <v-btn color="blue darken-1" text @click="readIdKaryawan()">
              Print QR Code
            </v-btn>
          </v-card-actions>
        </v-card>
        <div>
          <vue-html2pdf
            :show-layout="false"
            :float-layout="true"
            :enable-download="true"
            :preview-modal="false"
            :paginate-elements-by-height="2000"
            :filename="filename"
            :pdf-quality="2"
            :manual-pagination="false"
            pdf-format="a6"
            pdf-orientation="portrait"
            pdf-content-width="370px"
            @progress="onProgress($event)"
            @hasStartedGeneration="hasStartedGeneration()"
            @hasGenerated="hasGenerated($event)"
            ref="html2Pdf"
          >
            <section slot="pdf-content">
              <v-card
                style="font-family: 'Montserrat', sans-serif"
                class="parent"
              >
                <v-card-title>
                  <img src="../assets/AKBresto.jpg" alt="logo" height="120px" />
                </v-card-title>
                <v-card-text class="child">
                  <qrcode-vue :value="value" size="150" level="H" />
                  <br />
                  <p>
                    <b>Printed {{ currentDate }} {{ currentTime }}</b>
                  </p>
                  <p>Printed by {{ karyawan }}</p>
                  <br />
                  ______________________________
                  <h3>FUN PLACE TO GRILL</h3>
                  ______________________________
                </v-card-text>
              </v-card>
            </section>
          </vue-html2pdf>
        </div>
      </v-dialog>

      <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>
        {{ error_message }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>


<script>
import Vue from "vue";
import QrcodeVue from "qrcode.vue";
import VueHtml2pdf from "vue-html2pdf";
import moment from "moment";
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
  name: "reservasi",
  components: {
    QrcodeVue,
    VueHtml2pdf,
    //       'validation-errors': ValidationErrorsComp
  },
  data() {
    return {
      filename: null,
      sortBy: "tgl_reservasi", //karena entah kenapa tabel yg ini ga urut ID
      //untuk QR Code
      value: {},
      size: 200, //ukuran QR

      inputCustomerType: "", //Ada 2: cari(pake autocomplete) dan tambah (new customer)
      //Validation Error
      validationErrors: "",
      validationErrorsCustomer: "",
      //Time and date unk print qr code
      currentDate: null,
      currentTime: null,

      search: null,
      inputType: "Tambah",
      //Untuk menentukan statusnya aktif/nonaktif
      statusType: "",
      //Id
      editedIndex: -1,
      deleteId: -1,
      editId: -1,
      //Dialog
      dialog: false,
      dialogQrCode: false,
      dialogConfirm: false,
      //Select untuk filter status
      statusSelect: "Not Started",
      //Form Validation
      valid: true,
      validCustomer: true,
      //Date Picker
      menuDate: false,
      //SnackBar
      snackbar: false,
      error_message: false,
      color: "",
      warning: [],
      //Header
      headers: [
        {
          text: "ID",
          align: "start",
          sortable: true,
          value: "id",
        },
        { text: "ID Customer", value: "id_customer" },
        { text: "Nama Customer", value: "nama" },
        { text: "Nomor Meja", value: "no_meja" },
        { text: "Tanggal Reservasi", value: "tgl_reservasi" },
        { text: "Sesi", value: "sesi" },
        { text: "Jenis Reservasi", value: "jenis" },
        { text: "Status", value: "status" },
        { text: "Action", value: "actions" },
      ],
      reservasi: [],
      editedItem: {
        id_customer: null,
        id: null,
        nama: null,
        email: null,
        telp: null,
        custConcat: null,
        id_meja: null,
        no_meja: null,
        tgl_reservasi: new Date().toISOString().substr(0, 10), //mengubah format date ke string,
        sesi: null,
        jenis: null,
        status: null,
        statusMeja: null,
      },
      //untuk tampung data karyawan yg print qr code
      karyawan: null,
      //untuk tau meja mana yg akan diubah statusnya jadi Isi
      afterQR: {
        id_meja: null,
        id_reservasi: null,
        status_reservasi: null,
      },
      //untuk tau reservasi mana yang akan diubah statusnya menjadi ongoing
      //Form untuk save dan update
      formData: new FormData(),
      //Untuk data meja yang kosong
      dataMeja: [], //semua data meja
      mejaKosong: [], //nampung nomor meja
      mejaKosongEdit: [],
      inputTanggalEdit: new Date().toISOString().substr(0, 10),
      inputSesiEdit: null,
      firstTime: 0,
      dataCustomer: [],
      customer: [],
    };
  },
  created() {
    this.inputType = this.$route.params.inputType;
  },
  methods: {
    //read data product
    readData() {
      var url = this.$api + "/reservasi";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.reservasi = response.data.data;
          console.log(this.reservasi);
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },
    moveToForm() {
      let posisi = localStorage.getItem("posisi");
      if (posisi == "Operational Manager") {
        this.$router.push({
          name: "reservasiFormOM",
          params: {
            inputType: "Tambah",
            editedIndex: -1,
            inputCustomerType: "",
            editId: -1,
            item: null,
          },
        });
      } else if (posisi == "Waiter") {
        this.$router.push({
          name: "reservasiFormWt",
          params: {
            inputType: "Tambah",
            editedIndex: -1,
            inputCustomerType: "",
            editId: -1,
            item: null,
          },
        });
      } else if (posisi == "Cashier") {
        this.$router.push({
          name: "reservasiFormCs",
          params: {
            inputType: "Tambah",
            editedIndex: -1,
            inputCustomerType: "",
            editId: -1,
            item: null,
          },
        });
      }
    },

    cancel() {
      console.log("masuk cancel biasa");
      this.editedIndex = -1;
      this.dialog = false;
      this.inputType = "Tambah";
      this.inputCustomerType = "";
      console.log(this.inputCustomerType);
    },

    cancelDelete() {
      console.log("masuk cancel");
      this.editedIndex = -1;
      this.dialogConfirm = false;
      this.inputCustomerType = "";
      this.inputType = "Tambah";
    },
    //fungsi setelah klik tombol, lalu ngatur sebelum edit beneran
    editItem(item) {
      this.$router.push({
        name: "reservasiForm",
        params: {
          inputType: "Ubah",
          editedIndex: item[".key"],
          inputCustomerType: "Cari", //untuk munculin v-autocomplete yg isinya data customer
          editId: item.id,
          item: item,
        },
      });
    },

    deleteItem(item) {
      this.inputType = "Delete";
      this.editedIndex = item[".key"];
      this.deleteId = item.id;
      this.dialogConfirm = true;
    },

    deleteData() {
      //mengahapus data
      var url = this.$api + "/reservasi/" + this.deleteId;
      //data dihapus berdasarkan id
      this.$http
        .delete(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.error_message = response.data.message;
          this.color = "green";
          this.snackbar = true;
          // this.close();
          this.readData(); //mengambil data
          this.dialogConfirm = false;
          this.inputType = "Tambah";
        })
        .catch((error) => {
          this.error_message = error.response.data.message;
          console.log(this.error_message);
          this.color = "red";
          this.snackbar = true;
          this.inputType = "Tambah";
        });
    },
    //untuk update status meja isi setelah print qr code -> status reservasi: ongoing -> status meja: isi
    updateMejaStatus() {
      let formDataMeja = new FormData();
      formDataMeja.append("status", "Isi");

      var url = this.$api + "/updateMejaStatus/" + this.afterQR.id_meja;
      this.$http
        .post(url, formDataMeja, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log("update status meja: ", response.data.message);
        })
        .catch((error) => {
          this.validationErrors = error.response.data.message;
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
    //dari id karyawan di local storage, dapet nama karyawan yg print qr code
    readIdKaryawan() {
      let id = window.localStorage.getItem("id");
      console.log("id karyawan: ", id);
      var url = this.$api + "/karyawan/" + id;
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log(response.data.data);
          this.karyawan = response.data.data.nama;
          console.log(this.karyawan);
          this.generateReport();
          console.log("status reservasi ", this.afterQR.status_reservasi);
          if (this.afterQR.status_reservasi == "Not Started") {
            this.updateMejaStatus();
            this.updateReservasiStatus();
          }
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },
    generateReport() {
      this.currentDate = moment().format().substring(0, 10);
      this.currentTime = moment().format("HH:mm:ss");
      this.$refs.html2Pdf.generatePdf();
      this.dialogQrCode = false;
    },
    isiQRCode(item) {
      this.value = {};
      this.value["id_customer"] = item.id_customer;
      this.value["id_reservasi"] = item.id;
      this.value["id_meja"] = item.id_meja;
      this.value["tgl_reservasi"] = item.tgl_reservasi;
      this.value["sesi"] = item.sesi;
      this.value = JSON.stringify(this.value);
      //untuk tau meja mana yg akan diubah statusnya jadi Isi
      this.afterQR.id_meja = item.id_meja;
      this.afterQR.id_reservasi = item.id;
      this.afterQR.status_reservasi = item.status;
      console.log("status reservasi isi QR ", this.afterQR.status_reservasi);
      this.filename =
        "QR_" + item.nama + "_" + item.tgl_reservasi + "_" + item.sesi;
    },
  },
  computed: {
    formTitle() {
      return this.editedIndex == -1 ? "Tambah Reservasi" : "Edit Reservasi";
    },
    filteredItems() {
      return this.reservasi.filter((i) => {
        if (this.statusSelect == "Semua") {
          //kalau select = semua, maka this.statusSelect = null karena baru bisa muncul semua data kalo null
          console.log(this.statusSelect);
          this.statusSelect = null;
        }
        return !this.statusSelect || i.status === this.statusSelect;
      });
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
/* 
.marginAll {
  margin: 10px 30px;
} */

.tabInput {
  margin-left: 30px;
}

.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 40%;
}

.bgColorCardTitle {
  background-color: antiquewhite;
}

a {
  text-decoration: none;
}
/* biar center qr codenya */
.parent {
  display: grid;
  place-items: center;
}
.child {
  text-align: center;
}
</style>