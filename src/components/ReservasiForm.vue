<template>
  <v-app>
    <v-main class="list">
      <v-container>
        <h1>
          <b> {{ this.inputType }} Reservasi</b>
        </h1>
        <br />
        <validation-errors
          :errors="validationErrorsCustomer"
          v-if="validationErrorsCustomer"
          style="
            background-color: #d24848;
            padding: 10px;
            color: white;
            border-radius: 10px;
          "
        ></validation-errors>
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
        <v-card-subtitle class="text-h6">
          <span class="submenuForm"> Data Customer </span>
        </v-card-subtitle>
        <v-divider style="margin-top: -15px"></v-divider>
        <br />
        <div class="tabInput">
          <v-btn
            rounded
            color="#F9DB6D"
            small
            @click="inputCustomerType = 'Tambah'"
          >
            Tambah Data Customer
          </v-btn>
          <v-btn
            color="#F9DB6D"
            rounded
            small
            style="position: relative; left: 10px"
            @click="
              inputCustomerType = 'Cari';
              readCustomer(null);
            "
          >
            Pilih Data Customer
          </v-btn>
        </div>
        <v-form
          ref="formCustomer"
          v-model="validCustomer"
          lazy-validation
          class="font"
        >
          <br />
          <div v-if="inputCustomerType == 'Tambah'">
            <v-text-field
              class="tabInput"
              v-model="editedItem.nama"
              label="Nama Customer"
              :rules="[(v) => !!v || 'Nama customer tidak boleh kosong!']"
              required
            ></v-text-field>
            <v-text-field
              class="tabInput"
              v-model="editedItem.email"
              label="Email Customer"
              :rules="[(v) => !!v || 'Email tidak boleh kosong!']"
              required
            ></v-text-field>
            <v-text-field
              class="tabInput"
              v-model="editedItem.telp"
              label="Telepon Customer"
              :rules="[(v) => !!v || 'Telepon tidak boleh kosong!']"
              hint="Contoh: 08xx"
              required
            ></v-text-field>
          </div>
          <div v-if="inputCustomerType == 'Cari'">
            <v-autocomplete
              class="tabInput"
              v-model="editedItem.custConcat"
              label="Nama Customer"
              :items="customer"
              :rules="[(v) => !!v || 'Nama customer tidak boleh kosong!']"
              required
            ></v-autocomplete>
          </div>
          <br />
        </v-form>

        <v-card-subtitle class="text-h6">
          <span class="submenuForm"> Data Reservasi </span>
        </v-card-subtitle>
        <v-divider style="margin-top: -15px; height: 20px"></v-divider>
        <br />

        <v-select
          class="tabInput"
          v-model="editedItem.jenis"
          label="Jenis Reservasi"
          :items="['Langsung', 'Telepon']"
          required
          @change="ubahJenisReservasi()"
          :rules="[(v) => !!v || 'Jenis tidak boleh kosong!']"
        ></v-select>

        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          class="font"
          v-show="editedItem.jenis"
        >
          <v-menu
            class="tabInput"
            v-model="menuDate"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
            v-if="editedItem.jenis != 'Langsung'"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="editedItem.tgl_reservasi"
                label="Tanggal Reservasi"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                @click="nullInputMeja()"
                :rules="[(v) => !!v || 'Date is required']"
                required
              ></v-text-field>
            </template>
            <v-date-picker
              id="datePicker"
              v-model="editedItem.tgl_reservasi"
              @input="menuDate = false"
              :min="currentDate"
            ></v-date-picker>
          </v-menu>
          <!-- Input sesi reservasi telepon -->
          <v-select
            prepend-icon="mdi-clock"
            v-model="editedItem.sesiTemp"
            label="Sesi"
            :items="['Lunch (11.00-16.00)', 'Dinner (17.00-21.00)']"
            required
            @change="nullInputMeja()"
            :rules="[(v) => !!v || 'Sesi tidak boleh kosong!']"
            v-if="editedItem.jenis != 'Langsung'"
          ></v-select>
          <v-text-field
            prepend-icon="mdi-table-furniture"
            v-model="editedItem.no_meja"
            v-if="editedItem.tgl_reservasi && editedItem.sesiTemp"
            @click="
              readMejaKosong(null);
              dialog = 'true';
            "
            label="Nomor Meja"
            required
            readonly
            :rules="[(v) => !!v || 'Meja tidak boleh kosong!']"
          ></v-text-field>
        </v-form>
        <br />
        <div style="float: right">
          <v-btn color="red darken-1" text @click="moveToReservasi">
            Cancel
          </v-btn>
          <v-btn color="green darken-1" text @click="readIdMeja()">
            Save
          </v-btn>
        </div>
        <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>
          {{ error_message }}
        </v-snackbar>
      </v-container>

      <v-dialog v-model="dialog" max-width="700px">
        <v-card style="font-family: 'Montserrat', sans-serif; padding: 50px">
          <v-card-text class="font">
            <!-- primary/secondary itu transparansi tulisan -->
            <p
              class="font"
              style="font-size: 28px; font-weight: 600; color: #555d50"
            >
              Data Meja Kosong
            </p>
          </v-card-text>

          <v-row v-if="this.editedItem.jenis != 'Langsung'">
            <v-col
              v-for="(data, index) in mejaKosong"
              :key="index"
              max-width="344"
              min-width="100px"
              cols="3"
            >
              <v-card
                :color="'green'"
                style="padding-bottom: 20px"
                @click="chooseMeja(data)"
                class="containerCard mx-auto"
              >
                <v-card-title style="color: white">{{
                  mejaKosong[index]
                }}</v-card-title>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-if="this.editedItem.jenis == 'Langsung'">
            <v-col
              v-for="(data, index) in mejaKosongLangsung"
              :key="index"
              max-width="344"
              min-width="100px"
              cols="3"
            >
              <v-card
                :color="'green'"
                style="padding-bottom: 20px"
                @click="chooseMeja(data)"
                class="containerCard mx-auto"
              >
                <v-card-title style="color: white">{{
                  mejaKosongLangsung[index]
                }}</v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>


<script>
import Vue from "vue";
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
  name: "reservasiForm",
  props: ["inputType", "editedIndex", "inputCustomerType", "editId", "item"],
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },
  data() {
    return {
      currentDate: null,
      //validasi error
      validationErrors: "",
      validationErrorsCustomer: "",
      //search
      search: null,
      //Untuk menentukan statusnya aktif/nonaktif
      statusType: "",
      //Id,
      deleteId: -1,
      //Dialog
      dialog: false,
      //Select untuk filter status
      statusSelect: null,
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
          text: "No",
          align: "start",
          sortable: true,
          value: "no",
        },
        { text: "ID Customer", value: "id_customer" },
        { text: "Nama Customer", value: "nama" },
        { text: "Nomor Meja", value: "no_meja" },
        { text: "Tanggal Reservasi", value: "tgl_reservasi" },
        { text: "Sesi", value: "sesi" },
        { text: "Action", value: "actions" },
      ],
      reservasi: [],
      editedItem: {
        id_customer: null,
        nama: null,
        email: null,
        telp: null,
        custConcat: null,
        id_meja: null,
        no_meja: null,
        tgl_reservasi: new Date().toISOString().substr(0, 10), //mengubah format date ke string,
        sesiTemp:null,
        sesi: null,
        jenis: null,
        status: null,
      },
      //Form untuk save dan update
      formData: new FormData(),
      //Untuk data meja yang kosong
      dataMeja: [], //semua data meja
      mejaKosong: [], //nampung nomor meja yg kosong utk reservasi telpon
      mejaKosongEdit: [], //temporary
      mejaKosongLangsung: [], //meja kosong utk reservasi langsung
      inputTanggalEdit: new Date().toISOString().substr(0, 10),
      inputSesiEdit: null,
      firstTime: 0,
      dataCustomer: [],
      customer: [],
    };
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
    ubahJenisReservasi() {
      this.currentDate = moment().format().substr(0, 10); //dapet date yg skrg pake moment.js. Kalo pake new Date to iso string malah salah tglnya.
      if (this.editedItem.jenis == "Langsung") {
        this.editedItem.tgl_reservasi = this.currentDate;
        // console.log("hour ", currentHour);
        // if(current >= 11 && current <= 16) this.editedItem.sesi = 1
        // else if (current >= 17 && current <= 21) this.editedItem.sesi = 2
        // if (currentHour >= 1 && currentHour <= 16) this.editedItem.sesi = 1;
        // else if (currentHour >= 17 || currentHour == 0)
        //   this.editedItem.sesi = 2;
        this.editedItem.sesiTemp = "Langsung";
        this.editedItem.sesi = "Langsung";
      }
    },
    moveToReservasi() {
      this.$router.push("/om/reservasi");
    },
    pilihReadMejaKosong() {
      this.editedItem.jenis == "Langsung"
        ? this.readMejaKosongLangsung
        : this.readMejaKosong;
    },
    //read data product
    readMejaKosongLangsung() {
      var url = this.$api + "/meja";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          let dataMeja = response.data.data;
          for (var i = 0; i < dataMeja.length; i++) {
            if (dataMeja[i].status == "Kosong")
              this.mejaKosongLangsung.push(dataMeja[i].no_meja);
          }
        });
    },
    chooseMeja(data) {
      this.editedItem.no_meja = data;
      this.dialog = false;
    },
    //read data meja koosng
    readMejaKosong(item) {
      var url =
        this.$api +
        "/mejaKosong/" +
        this.editedItem.tgl_reservasi +
        "/" +
        this.editedItem.sesi;
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.mejaKosong = [];
          this.dataMeja = response.data.data;
          //masukin data ke v-select no meja
          for (var i = 0; i < this.dataMeja.length; i++) {
            this.mejaKosong.push(this.dataMeja[i].no_meja);
          }
          //biar pas edit, sesi yg dia pilih sebelumnya masih ada untuk tgl dan sesi tsb
          if (this.inputType == "Ubah" && this.firstTime == 0) {
            console.log("masuk ubah");
            this.firstTime = 1; // variabel utk biar cuma sekali kondisi ini dijalankan
            this.mejaKosong.push(item.no_meja);
            console.log("masuk item no meja: ", item.no_meja);
            console.log("list meja kosong: ", this.mejaKosong);
            this.mejaKosongEdit = this.mejaKosong; //variabel temp
            this.inputTanggalEdit = this.editedItem.tgl_reservasi;
            this.inputSesiEdit = this.editedItem.sesi;
          }
          //biar pas edit, sesi yg dia pilih sebelumnya masih ada untuk tgl dan sesi tsb. Versi setelah pilih tgl/sesi lain, tapi kembali lagi ke tgl/sesi awal
          if (this.inputType == "Ubah" && this.firstTime == 1) {
            this.firstTime = 1; // variabel utk biar cuma sekali kondisi ini dijalankan
            //jika tgl/sesi sama spt yg di awal, maka mejaKosong diisi dengan variabel temp yg isinya adalah list meja kosong + yg dia pilih
            if (
              this.inputTanggalEdit == this.editedItem.tgl_reservasi &&
              this.inputSesiEdit == this.editedItem.sesi
            )
              this.mejaKosong = this.mejaKosongEdit;
          }
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },
    //read Id meja dari no meja dan untuk save customer
    readIdMeja() {
      console.log("input customer type", this.inputCustomerType);
      if (
        this.inputCustomerType == "Tambah" ||
        this.inputCustomerType == "Cari"
      ) {
        if (this.$refs.formCustomer.validate() || this.$refs.form.validate()) {
          var url = this.$api + "/getIdMeja/" + this.editedItem.no_meja;

          this.$http
            .get(url, {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            })
            .then((response) => {
              this.editedItem.id_meja = response.data.data[0].id; //bentuknya array dan cuma ngembaliin satu nilai, jadi pakai [0]
              console.log("Id meja", this.editedItem.id_meja);
              this.saveCustomer();
            })
            .catch((error) => {
              console.log(error.response.data.message);
              this.validationErrors = ["Masukkan data reservasi!"];
              window.scroll({
                top: 0,
                left: 0,
                behavior: "smooth",
              });
            });
        }
      } else {
        this.validationErrors = ["Masukkan data customer!"];
      }
    },

    //read data customer
    readCustomer(item) {
      var url = this.$api + "/customer";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.customer = [];
          this.dataCustomer = response.data.data;
          for (var i = 0; i < this.dataCustomer.length; i++) {
            this.customer.push(
              this.dataCustomer[i].id +
                " - " +
                this.dataCustomer[i].nama +
                " - " +
                this.dataCustomer[i].email +
                " - " +
                this.dataCustomer[i].telp
            );
          }
          if (this.inputType == "Ubah") {
            //untuk auto ke isi sesuai data saat mau update
            this.editedItem.custConcat =
              item.id_customer +
              " - " +
              item.nama +
              " - " +
              item.email +
              " - " +
              item.telp;
          }
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },

    //fungsi utk me-nullkan no meja saat ganti sesi atau tanggal
    nullInputMeja() {
      this.editedItem.no_meja = null;
      if(this.editedItem.sesiTemp == "Lunch (11.00-16.00)") this.editedItem.sesi = 1
      else if(this.editedItem.sesiTemp == "Dinner (17.00-21.00)") this.editedItem.sesi = 2
      else if(this.editedItem.sesiTemp == "Langsung") this.editedItem.sesi = "Langsung"
      console.log(`Sesi: ${this.editedItem.sesi}`);
    },

    saveCustomer() {
      if (this.$refs.formCustomer.validate() && this.$refs.form.validate()) {
        if (this.inputCustomerType == "Tambah") {
          this.formData.append("nama", this.editedItem.nama);
          this.formData.append("email", this.editedItem.email);
          this.formData.append("telp", this.editedItem.telp);

          var url = this.$api + "/customer";
          this.validCustomer = true;
          this.$http
            .post(url, this.formData, {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            })
            .then(() => {
              console.log("SUKSES");
              this.readIdCustomerLastAndSave();
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
        } else if (this.inputCustomerType == "Cari") {
          var custConcat = this.editedItem.custConcat; //ditampung dulu, karena kalo langsung entah kenapa error
          var id_customer = custConcat.substring(0, custConcat.indexOf(" -"));
          this.editedItem.id_customer = id_customer;
          console.log("id customer", this.editedItem.id_customer);

          if (this.inputType == "Tambah") this.save();
          else if (this.inputType == "Ubah") this.update();
        }
      }
    },
    //cari id customer yang terakhir dan save semua
    readIdCustomerLastAndSave() {
      var url = this.$api + "/getIdCustomerLast";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.editedItem.id_customer = response.data.data.id;
          if (this.inputType == "Tambah") this.save();
          else if (this.inputType == "Ubah") this.update();
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },
    save() {
      if (this.$refs.form.validate()) {
        this.formData.append("id_customer", this.editedItem.id_customer);
        this.formData.append("id_meja", this.editedItem.id_meja);
        this.formData.append("tgl_reservasi", this.editedItem.tgl_reservasi);
        this.formData.append("sesi", this.editedItem.sesi);
        this.formData.append("jenis", this.editedItem.jenis);
        this.formData.append("status", "Not Started");

        var url = this.$api + "/reservasi";
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
            this.dialog = false;
            window.setTimeout(this.moveToReservasi, 700); //biar snackbarnya muncul dulu
          })
          .catch((error) => {
            console.log("GAGAL");
            this.validationErrors = error.response.data.message;
          });
      }
    },

    update() {
      this.formData.append("id_customer", this.editedItem.id_customer);
      this.formData.append("id_meja", this.editedItem.id_meja);
      this.formData.append("tgl_reservasi", this.editedItem.tgl_reservasi);
      this.formData.append("sesi", this.editedItem.sesi);
      this.formData.append("jenis", this.editedItem.jenis);

      var url = this.$api + "/reservasi/" + this.editId;
      this.$http
        .post(url, this.formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log("masuk update");
          this.error_message = response.data.message;
          this.color = "green";
          this.snackbar = true;
          this.dialog = false;
          window.setTimeout(this.moveToReservasi, 700); //biar snackbarnya muncul dulu
        })
        .catch((error) => {
          console.log("masuk update error");
          this.validationErrors = error.response.data.message;
          window.scrollTo(0, 0); //supaya scroll ke atas dan keliatan message errornya
        });
    },

    //fungsi setelah klik tombol, lalu ngatur sebelum edit beneran
    editItem() {
      this.editedItem = Object.assign({}, this.item); //copies all enumerable own properties from one or
      //more source objects to a target object. It returns the target object.

      //supaya field new customernya kosong (soalnya keisi sama data editnya)
      this.editedItem.nama = "";
      this.editedItem.email = "";
      this.editedItem.telp = "";

      this.readCustomer(this.item);
      this.readMejaKosong(this.item);
      this.readMejaKosongLangsung(this.item);
    },
  },
  computed: {
    formTitle() {
      return this.editedIndex == -1 ? "Tambah Reservasi" : "Edit Reservasi";
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

.tabInput {
  margin-left: 30px;
}

.containerCard {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bgColorCardTitle {
  background-color: antiquewhite;
}

.submenuForm {
  font-family: "Playfair Display";
  font-weight: 600;
  font-size: 25px;
}
</style>