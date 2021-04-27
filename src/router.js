import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
function importComponent(path) {
    return () => import(`./components/${path}.vue`)
}
Vue.use(VueRouter);
const router = new VueRouter({
    mode: "history",
    routes: [
        {
            path: "/",
            name: "login",
            meta: { title: 'Login' },
            component: importComponent('Login'),
        },
        {
            path: "/om",
            name: "OperationalManager",
            component: importComponent('SideBar/OMSideBar'),
            children: [
                {
                    path: "/om/karyawan",
                    name: "karyawanOM",
                    meta: { title: 'Karyawan' },
                    component: importComponent('Karyawan'),
                },
                {
                    path: "/om/customer",
                    name: "customerOM",
                    meta: { title: 'Customer' },
                    component: importComponent('Customer'),
                },
                {
                    path: "/om/bahan",
                    name: "bahanOM",
                    meta: { title: 'Bahan' },
                    component: importComponent('Bahan'),
                },
                {
                    path: "/om/meja",
                    name: "mejaOM",
                    meta: { title: 'Meja' },
                    component: importComponent('Meja'),
                },
                {
                    path: "/om/kartu",
                    name: "kartuOM",
                    meta: { title: 'Kartu' },
                    component: importComponent('Kartu'),
                },
                {
                    path: "/om/reservasi",
                    name: "reservasiOM",
                    meta: { title: 'Reservasi' },
                    component: importComponent('Reservasi'),
                    props: true,
                },
                {
                    path: "/om/reservasiForm",
                    name: "reservasiFormOM",
                    meta: { title: 'ReservasiForm' },
                    props: true,
                    component: importComponent('ReservasiForm'),
                },
                {
                    path: "/om/menu",
                    name: "menuOM",
                    meta: { title: 'Menu' },
                    props: true,
                    component: importComponent('Menu'),
                },
                {
                    path: "/om/menuForm",
                    name: "menuFormOM",
                    meta: { title: 'Menu Form' },
                    props: true,
                    component: importComponent('MenuForm'),
                },
                {
                    path: "/om/pesanan",
                    name: "pesananOM",
                    meta: { title: 'Pesanan' },
                    props: true,
                    component: importComponent('PesananOM'),
                },
                {
                    path: "/om/transaksi",
                    name: "transaksiOM",
                    meta: { title: 'Transaksi' },
                    props: true,
                    component: importComponent('Transaksi'),
                },
                {
                    path: "/om/riwayatMasuk",
                    name: "riwayatMasukOM",
                    meta: { title: 'Riwayat Masuk' },
                    props: true,
                    component: importComponent('RiwayatMasuk'),
                },
                {
                    path: "/om/riwayatKeluar",
                    name: "riwayatKeluarOM",
                    meta: { title: 'Riwayat Keluar' },
                    props: true,
                    component: importComponent('RiwayatKeluar'),
                },
                {
                    path: "/om/laporan",
                    name: "laporanOM",
                    meta: { title: 'Laporan' },
                    props: true,
                    component: importComponent('Laporan'),
                },
            ],
            beforeEnter: (to, from, next) => {
                if (localStorage.getItem('token') && localStorage.getItem('posisi') == "Operational Manager") next()
                else next('/notFound');
            }
        },
        {
            path: "/owner",
            name: "Owner",
            component: importComponent('SideBar/OwnerSideBar'),
            children: [
                {
                    path: "/owner/karyawan",
                    name: "karyawanOwner",
                    meta: { title: 'Karyawan' },
                    component: importComponent('Karyawan'),
                },
                {
                    path: "/owner/laporan",
                    name: "laporanOwner",
                    meta: { title: 'Laporan' },
                    props: true,
                    component: importComponent('Laporan'),
                },

            ],
            beforeEnter: (to, from, next) => {
                if (localStorage.getItem('token') && localStorage.getItem('posisi') == "Owner") next()
                else next('/');
            }
        },
        {
            path: "/waiter",
            name: "Waiter",
            component: importComponent('SideBar/WaiterSideBar'),
            children: [
                {
                    path: "/waiter/customer",
                    name: "customerWt",
                    meta: { title: 'Customer' },
                    component: importComponent('Customer'),
                },
                {
                    path: "/waiter/meja",
                    name: "mejaReadWt",
                    meta: { title: 'Meja' },
                    component: importComponent('MejaRead'),
                    props: true,
                },
                {
                    path: "/waiter/menu",
                    name: "menuReadWt",
                    meta: { title: 'Menu' },
                    component: importComponent('MenuRead'),
                    props: true,
                },
                {
                    path: "/waiter/reservasi",
                    name: "reservasiWt",
                    meta: { title: 'Reservasi' },
                    component: importComponent('Reservasi'),
                    props: true,
                },
                {
                    path: "/waiter/reservasiForm",
                    name: "reservasiFormWt",
                    meta: { title: 'ReservasiForm' },
                    props: true,
                    component: importComponent('ReservasiForm'),
                },
                {
                    path: "/waiter/pesanan",
                    name: "pesananWt",
                    meta: { title: 'Pesanan' },
                    props: true,
                    component: importComponent('PesananWaiter'),
                },

            ],
            beforeEnter: (to, from, next) => {
                if (localStorage.getItem('token') && localStorage.getItem('posisi') == "Waiter") next()
                else next('/');
            }
        },
        {
            path: "/chef",
            name: "Chef",
            component: importComponent('SideBar/ChefSideBar'),
            children: [
                {
                    path: "/chef/bahan",
                    name: "bahanCf",
                    meta: { title: 'Bahan' },
                    component: importComponent('Bahan'),
                    props: true,
                },
                {
                    path: "/chef/meja",
                    name: "mejaReadCf",
                    meta: { title: 'Meja' },
                    component: importComponent('MejaRead'),
                    props: true,
                },
                {
                    path: "/chef/menu",
                    name: "menuReadCf",
                    meta: { title: 'Menu' },
                    component: importComponent('MenuRead'),
                    props: true,
                },
                {
                    path: "/chef/pesanan",
                    name: "pesananCf",
                    meta: { title: 'Pesanan' },
                    props: true,
                    component: importComponent('PesananWaiter'),
                },
                {
                    path: "/chef/riwayatKeluar",
                    name: "riwayatKeluarCf",
                    meta: { title: 'Riwayat Keluar' },
                    props: true,
                    component: importComponent('RiwayatKeluar'),
                },
                {
                    path: "/chef/riwayatMasuk",
                    name: "riwayatMasukCf",
                    meta: { title: 'Riwayat Masuk' },
                    props: true,
                    component: importComponent('RiwayatMasuk'),
                },

            ],
            beforeEnter: (to, from, next) => {
                if (localStorage.getItem('token') && localStorage.getItem('posisi') == "Chef") next()
                else next('/');
            }
        },
        {
            path: "/cashier",
            name: "Cashier",
            component: importComponent('SideBar/CashierSideBar'),
            children: [
                {
                    path: "/cashier/customer",
                    name: "customerCs",
                    meta: { title: 'Customer' },
                    component: importComponent('Customer'),
                },
                {
                    path: "/cashier/meja",
                    name: "mejaCs",
                    meta: { title: 'Meja' },
                    component: importComponent('MejaRead'),
                },
                {
                    path: "/cashier/kartu",
                    name: "kartuCs",
                    meta: { title: 'Kartu' },
                    component: importComponent('Kartu'),
                },
                {
                    path: "/cashier/reservasi",
                    name: "reservasiCs",
                    meta: { title: 'Reservasi' },
                    component: importComponent('Reservasi'),
                    props: true,
                },
                {
                    path: "/cashier/reservasiForm",
                    name: "reservasiFormCs",
                    meta: { title: 'ReservasiForm' },
                    props: true,
                    component: importComponent('ReservasiForm'),
                },
                {
                    path: "/cashier/menu",
                    name: "menuCs",
                    meta: { title: 'Menu' },
                    props: true,
                    component: importComponent('MenuRead'),
                },
                {
                    path: "/cashier/pesanan",
                    name: "pesananCs",
                    meta: { title: 'Pesanan' },
                    props: true,
                    component: importComponent('PesananCashier'),
                },
                {
                    path: "/cashier/transaksi",
                    name: "transaksiCs",
                    meta: { title: 'Transaksi' },
                    props: true,
                    component: importComponent('Transaksi'),
                },

            ],
            beforeEnter: (to, from, next) => {
                if (localStorage.getItem('token') && localStorage.getItem('posisi') == "Cashier") next()
                else next('/');
            }
        },
        {
            path: "*",
            name: "notFound",
            meta: { title: 'Not Found' },
            component: importComponent('NotFound'),
        },

    ],
});
//Set judul
router.beforeEach((to, from, next) => {
    document.title = to.meta.title
    next()
});
export default router;