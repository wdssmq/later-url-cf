module.exports = {
    'env': {
        'es2021': true,
        'node': true,
    },
    'extends': 'eslint:recommended',
    'overrides': [
        {
            'env': {
                'node': true,
            },
            'files': [
                '.eslintrc.{js,cjs}',
            ],
            'parserOptions': {
                'sourceType': 'script',
            },
        },
    ],
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
    },
    'rules': {
        'indent': [
            'error',
            4,
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        'quotes': [
            'error',
            'single',
        ],
        'semi': [
            'error',
            'never',
        ],
        'spaced-comment': [
            'error',
            'always',
        ],

        // ----------------------

        // 对象或数组的拖尾逗号
        // always-multiline 表示只有在多行时才需要拖尾逗号
        'comma-dangle': [
            1,
            'always-multiline',
        ],

        // 箭头函数参数括号
        // as-needed 表示只有在需要时才添加括号
        'arrow-parens': [
            1,
            'as-needed',
            { 'requireForBlockBody': true },
        ],

        // 变量声明后未使用
        // args: "none" 表示不检查函数参数是否被使用
        'no-unused-vars': [
            1,
            { 'args': 'none' },
        ],

        // 函数圆括号之前的空格
        // anonymous: "never" 表示匿名函数不允许空格
        // named: "never" 表示命名函数不允许空格
        'space-before-function-paren': [
            1,
            { 'anonymous': 'never', 'named': 'never' },
        ],

        // 禁止不规则的空白
        'no-irregular-whitespace': [
            2,
            { 'skipStrings': true, 'skipRegExps': true },
        ],

    },
}
