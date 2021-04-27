<template>
  <v-app>
    <v-main class="list">
      <h1><b>Karyawan</b></h1>
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
            :items="['Semua', 'Aktif', 'Non-Aktif']"
            label="Filter Status"
          ></v-select>
          <v-spacer></v-spacer>
          <v-btn color="#60A561" dark @click="dialog = true">
            Tambah Karyawan
          </v-btn>
        </v-card-title>
        <v-data-table :headers="headers" :items="filteredData" :search="search">
          <template v-slot:[`item.status`]="{ item }">
            <v-chip :color="getColor(item.status)" label outlined dark>
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-btn small text @click="editItem(item)">
              <v-icon> mdi-pencil </v-icon>
            </v-btn>
            <v-btn
              small
              text
              @click="updateStatusItem(item, 'Non-Aktif')"
              v-if="item.status == 'Non-Aktif'"
            >
              <v-icon style="color: green"> mdi-account-check </v-icon>
            </v-btn>
            <v-btn
              small
              text
              @click="updateStatusItem(item, 'Aktif')"
              v-if="item.status == 'Aktif'"
            >
              <v-icon style="color: red"> mdi-account-off </v-icon>
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
                  v-model="editedItem.nama"
                  label="Nama"
                  :rules="[(v) => !!v || 'Nama karyawan tidak boleh kosong!']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  v-show="inputType == 'Tambah'"
                  :rules="[(v) => !!v || 'Email tidak boleh kosong!']"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  :rules="[(v) => !!v || 'Email tidak boleh kosong!']"
                  v-show="inputType == 'Ubah'"
                  disabled
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedItem.telp"
                  label="Telepon"
                  required
                  :rules="[(v) => !!v || 'Telepon tidak boleh kosong!']"
                  hint="Contoh: 08xx"
                  autocomplete="off"
                ></v-text-field>
                <v-select
                  v-model="editedItem.jk"
                  :items="['Laki-laki', 'Perempuan']"
                  label="Jenis Kelamin"
                  :rules="[(v) => !!v || 'Jenis Kelamin tidak boleh kosong']"
                  required
                ></v-select>
                <v-select
                  v-model="editedItem.posisi"
                  label="Posisi"
                  :items="[
                    'Owner',
                    'Operational Manager',
                    'Waiter',
                    'Cashier',
                    'Chef',
                  ]"
                  required
                  :rules="[(v) => !!v || 'Posisi tidak boleh kosong!']"
                ></v-select>
                <v-menu
                  v-model="menuDate"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="editedItem.tgl_gabung"
                      label="Tanggal Bergabung"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[(v) => !!v || 'Date is required']"
                      required
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedItem.tgl_gabung"
                    @input="menuDate = false"
                  ></v-date-picker>
                </v-menu>
                <v-text-field
                  v-if="this.inputType == 'Tambah'"
                  v-model="editedItem.password"
                  label="Password"
                  required
                  :rules="[(v) => !!v || 'Password tidak boleh kosong!']"
                  type="password"
                  hint="Minta karyawan anda untuk mengubah password"
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

      <v-dialog v-model="dialogConfirm" persistent max-width="400px">
        <v-card style="font-family: 'Montserrat', sans-serif">
          <v-card-title>
            <span>Peringatan!</span>
          </v-card-title>
          <v-card-text>
            Anda yakin ingin mengganti status karyawan?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="cancelUpdateStatus()">
              Cancel
            </v-btn>

            <v-btn
              color="green darken-1"
              text
              @click="updateStatus(statusType)"
            >
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
  name: "Karyawan",
  data() {
    return {
      //Untuk validasi yang json errornya sudah diambil valuenya saja
      validationErrors: "",
      //Untuk search
      search: null,
      //Untuk menentukan form tambah atau edit
      inputType: "Tambah",
      //Untuk menentukan statusnya aktif/nonaktif
      statusType: "",
      //Id
      editedIndex: -1,
      updateStatusId: -1,
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
        { text: "Nama", value: "nama" },
        { text: "Email", value: "email" },
        { text: "Telepon", value: "telp" },
        { text: "Jenis Kelamin", value: "jk" },
        { text: "Posisi", value: "posisi" },
        { text: "Tanggal Bergabung", value: "tgl_gabung" },
        { text: "Status", value: "status" },
        { text: "Action", value: "actions" },
      ],
      users: [],
      formUser: {
        nama: null,
        email: null,
        telp: null,
        jk: null,
        tgl_gabung: new Date().toISOString().substr(0, 10),
        password: null,
      },
      editedItem: {
        nama: null,
        email: null,
        telp: null,
        jk: null,
        tgl_gabung: new Date().toISOString().substr(0, 10), //mengubah format date ke string
        password: null,
      },
      //Form untuk save dan update
      formData: new FormData(),
    };
  },
  methods: {
    //read data product
    readData() {
      var url = this.$api + "/getKaryawan";
      this.$http
        .get(url, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.users = response.data.data;
        });
    },
    getColor(status) {
      if (status == "Aktif") return "green";
      else if (status == "Non-Aktif") return "red";
    },
    setForm() {
      if (this.inputType === "Tambah") {
        this.save();
      } else {
        this.updateAll();
      }
    },
    save() {
      if (this.$refs.form.validate()) {
        console.log("MASUK");
        this.formData.append("nama", this.editedItem.nama);
        this.formData.append("email", this.editedItem.email);
        this.formData.append("telp", this.editedItem.telp);
        this.formData.append("jk", this.editedItem.jk);
        this.formData.append("posisi", this.editedItem.posisi);
        this.formData.append("tgl_gabung", this.editedItem.tgl_gabung);
        this.formData.append("status", "Aktif");
        this.formData.append("password", this.editedItem.password);

        var url = this.$api + "/register";
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
            window.scroll({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          });
      }
    },
    updateAll() {
      this.formData.append("nama", this.editedItem.nama);
      this.formData.append("email", this.editedItem.email);
      this.formData.append("telp", this.editedItem.telp);
      this.formData.append("jk", this.editedItem.jk);
      this.formData.append("posisi", this.editedItem.posisi);
      this.formData.append("tgl_gabung", this.editedItem.tgl_gabung);
      this.formData.append("status", this.editedItem.status);
      console.log(this.editedItem.tgl_gabung);

      var url = this.$api + "/updateKaryawan/" + this.editId;
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

    updateStatus(jenisStatus) {
      console.log("jenis status", jenisStatus);
      this.formData.append("status", jenisStatus);

      var url = this.$api + "/nonAktifKaryawan/" + this.updateStatusId;
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
          this.dialogConfirm = false;
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
      this.editedIndex = -1;
      this.dialog = false;
      this.resetForm();
      this.inputType = "Tambah";
    },
    cancelUpdateStatus() {
      this.editedIndex = -1;
      this.dialogConfirm = false;
      this.inputType = "Tambah";
    },

    editItem(item) {
      this.inputType = "Ubah";
      this.editedIndex = item[".key"];
      this.editedItem = Object.assign({}, item);
      this.editId = item.id;
      this.dialog = true;
    },

    updateStatusItem(item, status) {
      if (status == "Non-Aktif") this.statusType = "Aktif";
      else this.statusType = "Non-Aktif";
      this.editedIndex = item[".key"];
      this.updateStatusId = item.id;
      this.dialogConfirm = true;
    },
  },
  computed: {
    filteredData() {
      return this.users.filter((i) => {
        if (this.statusSelect == "Semua") {
          //kalau select = semua, maka this.statusSelect = null karena baru bisa muncul semua data kalo null
          console.log(this.statusSelect);
          this.statusSelect = null;
        }
        return !this.statusSelect || i.status === this.statusSelect;
      });
    },
    formTitle() {
      return this.editedIndex === -1 ? "Tambah Karyawan" : "Edit Karyawan";
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