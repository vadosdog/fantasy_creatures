module.exports = configure(function (ctx) {
    return {
        framework: {
            iconSet: 'fontawesome-v6', // Используйте версию, соответствующую вашей установке
            config: {
                brand: {
                    primary: '#CC66FF',
                    secondary: '#26A69A',
                    accent: '#66CCFF',

                    dark: '#1d1d1d',
                    'dark-page': '#121212',

                    positive: '#21BA45',
                    negative: '#C10015',
                    info: '#31CCEC',
                    warning: '#F2C037'
                }
            }

        },
        extras: [
            'fontawesome-v6'
        ]
    }
})