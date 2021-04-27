<template>
  <v-app>
    <v-main class="list">
      <h1><b>Kartu</b></h1>
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
            Tambah Kartu
          </v-btn>
        </v-card-title>
        <v-data-table :headers="headers" :items="kartu" :search="search">
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
                  v-model="editedItem.no_kartu"
                  label="Nomor Kartu"
                  :rules="[(v) => !!v || 'Nomor kartu tidak boleh kosong!']"
                  required
                ></v-text-field>
                <v-select
                  v-model="editedItem.jenis_kartu"
                  :items="['Debit', 'Kredit']"
                  label="Jenis Kartu"
                  @change="getCurrentDate()"
                >
                </v-select>
                <v-text-field
                  v-model="editedItem.nama_kartu"
                  label="Nama Pemilik Kartu"
                  required
                  v-if="editedItem.jenis_kartu == 'Kredit'"
                  :rules="[(v) => !!v || 'Nama pemilik tidak boleh kosong!']"
                ></v-text-field>
                <v-menu
                  v-model="menuDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                  v-if="editedItem.jenis_kartu == 'Kredit'"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="editedItem.tgl_kadaluarsa"
                      label="Tanggal Kadaluarsa"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[
                        (v) => !!v || 'Tanggal kadaluarsa tidak boleh kosong!',
                      ]"
                      required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedItem.tgl_kadaluarsa"
                    @input="menuDate = false"
                    :min="currentDate"
                  ></v-date-picker>
                </v-menu>
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

      <v-dialog v-model="dialogConfirm" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title>
            <span>Peringatan!</span>
          </v-card-title>
          <v-card-text> Anda yakin ingin menghapus data kartu? </v-card-text>
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
  name: "kartu",
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },
  data() {
    return {
      currentDate: null,
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
      dialogPicture: false,
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
        { text: "Nomor Kartu", value: "no_kartu" },
        { text: "Jenis Kartu", value: "jenis_kartu" },
        { text: "Nama Pemilik", value: "nama_kartu" },
        { text: "Tanggal Kadaluarsa", value: "tgl_kadaluarsa" },
        { text: "Action", value: "actions" },
      ],
      kartu: [],
      editedItem: {
        no_kartu: null,
        jenis_kartu: null,
        nama_kartu: null,
        tgl_kadaluarsa: null,
      },
      //Form untuk save dan update
      formData: new FormData(),
    };
  },
  methods: {
    //read data product
    readData() {
      var url = this.$api + "/kartu";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.kartu = response.data.data;
        });
    },
    setForm() {
      if (this.inputType === "Tambah") {
        this.save();
      } else {
        this.update();
      }
    },
    getCurrentDate() {
      this.currentDate = moment().format().substr(0, 10);
    },
    save() {
      if (this.$refs.form.validate()) {
        console.log("MASUK");
        this.formData.append("no_kartu", this.editedItem.no_kartu);
        this.formData.append("jenis_kartu", this.editedItem.jenis_kartu);
        this.formData.append("nama_kartu", this.editedItem.nama_kartu);
        this.formData.append("tgl_kadaluarsa", this.editedItem.tgl_kadaluarsa);

        var url = this.$api + "/kartu";
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
      if (this.editedItem.jenis_kartu == "Debit") {
        console.log("MASUK KALO DEBIT");
        this.editedItem.nama_kartu = "";
        this.editedItem.tgl_kadaluarsa = "";
      }
      this.formData.append("no_kartu", this.editedItem.no_kartu);
      this.formData.append("jenis_kartu", this.editedItem.jenis_kartu);
      this.formData.append("nama_kartu", this.editedItem.nama_kartu);
      this.formData.append("tgl_kadaluarsa", this.editedItem.tgl_kadaluarsa);

      var url = this.$api + "/kartu/" + this.editId;
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

    deleteItem(item) {
      this.inputType = "Delete";
      this.editedIndex = item[".key"];
      this.deleteId = item.id;
      this.dialogConfirm = true;
    },

    deleteData() {
      //mengahapus data
      var url = this.$api + "/kartu/" + this.deleteId;
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
      return this.editedIndex == -1 ? "Tambah Kartu" : "Edit Kartu";
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