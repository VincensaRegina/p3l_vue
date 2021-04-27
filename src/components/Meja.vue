<template>
  <v-app>
    <v-main class="list">
      <h1><b>Meja</b></h1>

      <v-btn
        color="#60A561"
        dark
        @click="dialog = true"
        style="float: right; margin-left: 10px"
      >
        Tambah Meja
      </v-btn>
      <br />
      <v-card style="margin-top: 50px; min-width: 100px">
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
            :items="['Semua', 'Kosong', 'Isi']"
            label="Filter Status"
            @change="setFilter(statusSelect)"
          ></v-select>
        </v-card-title>
        <v-container>
          <v-layout row>
            <!-- xs dll itu untuk menyesuaikan besar cardnya utk tiap besar layar -->
            <v-flex
              xs8
              sm3
              md3
              lg2
              v-for="(data, index) in meja"
              :key="index"
              v-show="
                (filter === data.status || filter === 'Semua') &&
                (search == data.no_meja || search == '')
              "
            >
              <v-card
                :color="getColor(meja[index].status)"
                style="padding-bottom: 20px"
                class="ma-3"
              >
                <v-card-title style="color: white">{{
                  meja[index].no_meja
                }}</v-card-title>
                <v-card-subtitle style="color: white">{{
                  meja[index].status
                }}</v-card-subtitle>
                <v-icon
                  style="position: relative; left: 15px"
                  @click="editItem(data)"
                  >mdi-pencil
                </v-icon>
                <v-icon
                  style="position: relative; left: 25px"
                  @click="deleteItem(data)"
                  v-if="meja[index].status != 'Isi'"
                >
                  mdi-delete
                </v-icon>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
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
                  v-model="editedItem.no_meja"
                  label="Nomor meja"
                  :rules="[(v) => !!v || 'Nomor meja tidak boleh kosong!']"
                  required
                ></v-text-field>
                <v-select
                  v-if="inputType == 'Ubah'"
                  v-model="editedItem.status"
                  label="Status meja"
                  :items="['Kosong', 'Isi']"
                  :rules="[(v) => !!v || 'Status meja tidak boleh kosong!']"
                >
                </v-select>
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
          <v-card-text> Anda yakin ingin menghapus data meja? </v-card-text>
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
  name: "meja",
  //   components: {
  //       'validation-errors': ValidationErrorsComp
  //   },
  data() {
    return {
      //Untuk filter status
      filter: "Semua",
      //Untuk search
      search: "",
      //Untuk validasi yang json errornya sudah diambil valuenya saja
      validationErrors: "",
      warning: [],
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
      meja: [],
      editedItem: {
        no_meja: null,
        status: null,
      },
      //Form untuk save dan update
      formData: new FormData(),
    };
  },
  methods: {
    //read data product
    readData() {
      var url = this.$api + "/meja";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.meja = response.data.data;
        });
    },
    //Untuk filter status
    setFilter(filterName) {
      this.filter = filterName;
    },
    setForm() {
      if (this.inputType === "Tambah") {
        this.save();
      } else {
        this.update();
      }
    },
    getColor(status) {
      if (status == "Kosong") return "#60A561";
      else if (status == "Isi") return "#D24848";
    },
    save() {
      if (this.$refs.form.validate()) {
        this.formData.append("no_meja", this.editedItem.no_meja);
        this.formData.append("status", "Kosong");

        var url = this.$api + "/meja";
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
            console.log(response.data);
            this.color = "green";
            this.snackbar = true;
            this.readData(); //mengambil data
            this.resetForm();
            this.dialog = false;
          })
          .catch((error) => {
            console.log("GAGAL");
            this.validationErrors =[error.response.data.message];
            console.log(error.response.data.data);
          });
      }
    },
    update() {
      this.formData.append("no_meja", this.editedItem.no_meja);
      this.formData.append("status", this.editedItem.status);

      var url = this.$api + "/meja/" + this.editId;
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
        })
        .catch((error) => {
          this.validationErrors = error.response.data.message;
        });
    },

    resetForm() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.inputType = "Tambah";
      this.validationErrors = "";
      this.editedIndex = -1;
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
      var url = this.$api + "/meja/" + this.deleteId;
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
          this.readData(); //mengambil data
          this.dialogConfirm = false;
          this.inputType = "Tambah";
          this.editedIndex = -1;
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
      return this.editedIndex == -1 ? "Tambah Meja" : "Edit Meja";
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