<template>
  <v-app>
    <v-main class="list">
      <h1><b>Pesanan</b></h1>
      <br />
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
        </v-data-table>
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
export default {
  name: "pesananCashier",
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
  },

  mounted() {
    this.readPesananOngoing();
  },
};
</script>
<style>
.list,
.font {
  font-family: "Montserrat", sans-serif !important;
}
</style>