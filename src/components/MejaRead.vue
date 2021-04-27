<template>
  <v-app>
    <v-main class="list">
      <h1><b>Meja</b></h1>

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
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>

      <v-snackbar v-model="snackbar" :color="color" timeout="2000" bottom>
        {{ error_message }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>


<script>

export default {
  name: "mejaRead",
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

    getColor(status) {
      if (status == "Kosong") return "#60A561";
      else if (status == "Isi") return "#D24848";
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