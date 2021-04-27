<template>
  <v-app>
    <v-main class="list">
      <h1><b>Bahan</b></h1>
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
          <v-btn color="#60A561" dark @click="dialog = true">
            Tambah Bahan
          </v-btn>
          <br />
        </v-card-title>
        <v-card-title>
          <v-select
            v-model="statusSelect"
            :items="['Semua', 'Bahan Habis']"
            label="Filter Bahan"
          ></v-select>
          <v-spacer></v-spacer>
          <v-btn
            color="#60A561"
            dark
            @click="
              dialogMasuk = true;
              statusType = 'Tambah';
            "
          >
            Tambah Stok Bahan
          </v-btn>
          <v-btn
            color="#df2c2c"
            dark
            @click="
              dialogBuang = true;
              statusType = 'Buang';
            "
            style="margin-left: 10px"
          >
            Buang Stok Bahan
          </v-btn>
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :search="search"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn small text @click="editItem(item)">
              <v-icon> mdi-pencil </v-icon>
            </v-btn>
            <v-btn small text @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>

          <template v-slot:[`item.warning`]="{ item }">
            <v-icon v-if="item.stok == 0" color="red">mdi-alert-circle</v-icon>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog
        v-model="dialog"
        persistent
        max-width="600px"
        style="font-family: 'Montserrat', sans-serif"
      >
        <v-card>
          <v-card-title>
            <span style="font-family: 'Montserrat', sans-serif">{{
              formTitle
            }}</span>
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
              <br />
              <v-form ref="form" v-model="valid" lazy-validation class="font">
                <v-text-field
                  v-model="editedItem.nama_bahan"
                  label="Nama Bahan"
                  :rules="[(v) => !!v || 'Nama bahan tidak boleh kosong!']"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="editedItem.unit"
                  label="Unit"
                  required
                  :rules="[(v) => !!v || 'Unit tidak boleh kosong!']"
                ></v-text-field>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="cancel"> Cancel </v-btn>
            <v-btn color="green darken-1" text @click="setForm"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="dialogMasuk"
        persistent
        max-width="600px"
        style="font-family: 'Montserrat', sans-serif"
      >
        <v-card>
          <v-card-title>
            <span style="font-family: 'Montserrat', sans-serif"
              >Tambah Stok Bahan</span
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
              <br />
              <v-form
                ref="formMasuk"
                v-model="valid"
                lazy-validation
                class="font"
              >
                <v-select
                  v-model="editedItem.nama_bahan_concat"
                  :items="bahanConcat"
                  label="Nama Bahan"
                  :rules="[(v) => !!v || 'Nama bahan tidak boleh kosong!']"
                  required
                ></v-select>
                <v-text-field
                  v-model="editedItem.stok"
                  label="Jumlah Stok"
                  required
                  type="number"
                  :rules="[(v) => !!v || 'Jumlah stok tidak boleh kosong!']"
                ></v-text-field>
                <v-text-field
                  v-model="editedItem.biaya"
                  label="Biaya"
                  required
                  type="number"
                  :rules="[(v) => !!v || 'Biaya tidak boleh kosong!']"
                ></v-text-field>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="cancelTambahStok">
              Cancel
            </v-btn>
            <v-btn color="green darken-1" text @click="readIdRemainingStock()">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog
        v-model="dialogBuang"
        persistent
        max-width="600px"
        style="font-family: 'Montserrat', sans-serif"
      >
        <v-card>
          <v-card-title>
            <span style="font-family: 'Montserrat', sans-serif">
              Buang Stok Bahan
            </span>
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
              <br />
              <v-form
                ref="formBuang"
                v-model="valid"
                lazy-validation
                class="font"
              >
                <v-select
                  v-model="editedItem.nama_bahan_concat"
                  :items="bahanConcat"
                  label="Nama Bahan"
                  :rules="[(v) => !!v || 'Nama bahan tidak boleh kosong!']"
                  required
                ></v-select>
                <v-text-field
                  v-model="editedItem.stok"
                  label="Jumlah Stok yang Dibuang"
                  required
                  type="number"
                  :rules="[(v) => !!v || 'Jumlah stok tidak boleh kosong!']"
                ></v-text-field>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="cancelBuangStok">
              Cancel
            </v-btn>
            <v-btn color="green darken-1" text @click="readIdRemainingStock()">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogConfirm" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title>
            <span>Peringatan!</span>
          </v-card-title>
          <v-card-text> Anda yakin ingin menghapus data bahan? </v-card-text>
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
  name: "bahan",
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },
  data() {
    return {
      validationErrors: "",
      warning: [],
      search: null,
      //Untuk menentukan form tambah atau edit
      inputType: "Tambah",
      // untuk menentukan apakah ini bahan keluar atau masuk
      statusType: "",
      //Id
      editedIndex: -1,
      deleteId: -1,
      editId: -1,
      //Dialog
      dialog: false,
      dialogMasuk: false,
      dialogBuang: false,
      dialogConfirm: false,
      //untuk filter status
      jumlahStok: null,
      //Select untuk filter status
      statusSelect: "Semua",
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
        { text: "Nama Bahan", value: "nama_bahan" },
        { text: "Stok", value: "stok" },
        { text: "Unit", value: "unit" },
        { text: "Bahan Habis?", value: "warning" },
        { text: "Action", value: "actions" },
      ],
      bahan: [],
      bahanConcat: [],
      editedItem: {
        nama_bahan: null,
        nama_bahan_concat: null,
        stok: null,
        unit: null,
        biaya: null,
      },
      //Form untuk save dan update
      formData: new FormData(),
    };
  },
  methods: {
    //read data product
    readData() {
      var url = this.$api + "/bahan";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.bahan = response.data.data;
          this.bahanConcat = [];
          for (var i = 0; i < this.bahan.length; i++) {
            this.bahanConcat.push(
              this.bahan[i].id + " - " + this.bahan[i].nama_bahan
            );
          }
        });
    },
    save() {
      if (this.$refs.form.validate()) {
        console.log("MASUK");
        this.formData.append("nama_bahan", this.editedItem.nama_bahan);
        this.formData.append("stok", 0);
        this.formData.append("unit", this.editedItem.unit);

        var url = this.$api + "/bahan";
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
    //update nama dan unit
    update() {
      this.formData.append("nama_bahan", this.editedItem.nama_bahan);
      // this.formData.append("stok", this.editedItem.stok);
      this.formData.append("unit", this.editedItem.unit);

      var url = this.$api + "/bahan/" + this.editId;
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

    readIdRemainingStock() {
      let bahanConcat = this.editedItem.nama_bahan_concat; //ditampung dulu, karena kalo langsung entah kenapa error
      let id_bahan = bahanConcat.substring(0, bahanConcat.indexOf(" -"));
      console.log("id bahan", id_bahan);

      let tgl = moment().format().substr(0, 10);

      var url = this.$api + "/getIdRemainingStock/" + tgl + "/" + id_bahan;
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          let message = response.data.message;
          console.log("message: " + message);
          console.log("statusType:" + this.statusType);

          if (this.statusType == "Tambah") {
            if (message == "Empty") {
              //kalo kosong, maka tambah stok + tambah data remaining stock baru
              this.tambahStok(id_bahan);
              this.tambahRemainingStock(id_bahan);
            } else {
              let id_rs = response.data.data[0].id;
              this.tambahStok(id_bahan);
              this.updateRemainingStock(id_rs);
              console.log("id rs: " + id_rs);
            }
          } else if (this.statusType == "Buang") {
            if (message == "Empty") {
              console.log("masuk empty buang");
              this.validationErrors = ["Belum ada stok untuk bahan ini"];
            } else {
              console.log("masuk else buang");
              let id_rs = response.data.data[0].id;
              this.buangStok(id_bahan);
              this.buangRemainingStock(id_rs);
              console.log("id rs: " + id_rs);
            }
          }
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

    //update saat tambah stok
    tambahStok(id_bahan) {
      this.formData.append("stok", this.editedItem.stok);

      let url = this.$api + "/tambahStok/" + id_bahan;
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
          this.dialogMasuk = false;
          this.tambahRiwayatMasuk(id_bahan);
        })
        .catch((error) => {
          this.validationErrors = error.response.data.message;
        });
    },

    //update saat buang stok
    buangStok(id_bahan) {
      this.formData.append("stok", this.editedItem.stok);

      let url = this.$api + "/buangStok/" + id_bahan;
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
          this.dialogBuang = false;
          this.tambahRiwayatKeluar(id_bahan);
        })
        .catch((error) => {
          this.error_message = error.response.data.message;
          this.color = "red";
          this.snackbar = true;
        });
    },

    tambahRiwayatMasuk(id_bahan) {
      if (this.$refs.formMasuk.validate()) {
        this.formData.append("id_bahan", id_bahan);
        this.formData.append("stok_masuk", this.editedItem.stok);
        this.formData.append("biaya", this.editedItem.biaya);
        this.formData.append("tgl_masuk", moment().format().substr(0, 10)); //dapet date yg skrg pake moment.js. Kalo pake new Date to iso string malah salah tglnya.);

        let url = this.$api + "/riwayatMasuk";
        this.$http
          .post(url, this.formData, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
          .then((response) => {
            console.log(response.data.message);
            this.resetFormMasuk();
          })
          .catch((error) => {
            console.log("error riwayat masuk", error.response.data.message);
          });
      }
    },

    tambahRiwayatKeluar(id_bahan) {
      if (this.$refs.formBuang.validate()) {
        this.formData.append("id_bahan", id_bahan);
        this.formData.append("stok_keluar", this.editedItem.stok);
        this.formData.append("tgl_keluar", moment().format().substr(0, 10));
        this.formData.append("keterangan", "Buang"); //dapet date yg skrg pake moment.js. Kalo pake new Date to iso string malah salah tglnya.);

        let url = this.$api + "/riwayatKeluar";
        this.$http
          .post(url, this.formData, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
          .then((response) => {
            console.log(response.data.message);
            this.resetFormBuang();
          })
          .catch((error) => {
            console.log("error riwayat keluar", error.response.data.message);
          });
      }
    },
    //store data remaining baru kalo tgl dan id bahan belum ada di tabel
    tambahRemainingStock(id_bahan) {
      let tgl = moment().format().substr(0, 10);
      this.formData.append("tgl", tgl);
      this.formData.append("id_bahan", id_bahan);
      this.formData.append("stok", this.editedItem.stok);

      let url = this.$api + "/remainingStock";
      this.$http
        .post(url, this.formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log(response.data.message);
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },
    //update data remaining kalo tgl dan id bahan di tabel sudah ada
    updateRemainingStock(id_rs) {
      this.formData.append("stok", this.editedItem.stok);

      let url = this.$api + "/remainingTambahStok/" + id_rs;
      console.log("masuk setelah url");
      this.$http
        .post(url, this.formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log(response.data.message);
        })
        .catch((error) => {
          console.log("error remaining", error.response.data.message);
        });
    },

    buangRemainingStock(id_rs) {
      this.formData.append("stok", this.editedItem.stok);

      let url = this.$api + "/remainingBuangStok/" + id_rs;
      console.log("masuk setelah url");
      this.$http
        .post(url, this.formData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log(response.data.message);
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    },

    resetForm() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.validationErrors = "";
    },

    resetFormMasuk() {
      this.$refs.formMasuk.reset();
      this.$refs.formMasuk.resetValidation();
      this.validationErrors = "";
    },

    resetFormBuang() {
      this.$refs.formBuang.reset();
      this.$refs.formBuang.resetValidation();
      this.validationErrors = "";
    },

    cancel() {
      console.log("masuk cancel biasa");
      this.editedIndex = -1;
      this.dialog = false;
      this.resetForm();
      this.inputType = "Tambah";
    },

    cancelTambahStok() {
      this.editedIndex = -1;
      this.dialogMasuk = false;
      this.resetFormMasuk();
    },

    cancelBuangStok() {
      this.editedIndex = -1;
      this.dialogBuang = false;
      this.resetFormBuang();
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

    deleteItem(item) {
      this.inputType = "Delete";
      this.editedIndex = item[".key"];
      this.deleteId = item.id;
      this.dialogConfirm = true;
    },

    deleteData() {
      //mengahapus data
      var url = this.$api + "/bahan/" + this.deleteId;
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
  },
  computed: {
    formTitle() {
      return this.editedIndex == -1 ? "Tambah Bahan" : "Edit Bahan";
    },
    filteredItems() {
      return this.bahan.filter((i) => {
        if (this.statusSelect == "Bahan Habis") {
          this.jumlahStok = 0;
          return i.stok == this.jumlahStok;
        } else if (this.statusSelect == "Semua") {
          this.jumlahStok = null;
          // console.log("i.stok:" + i.stok);
          // console.log("jumlah stok: " + this.jumlahStok);
          return !this.jumlahStok || i.stok == this.jumlahStok;
        }
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
</style>