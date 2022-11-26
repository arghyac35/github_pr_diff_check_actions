# Using this action

You would need to put this in a file in `.github/workflows`

```
name: "Check PR diff for line"
on: [pull_request]

jobs:
  pr_diff_check:
    runs-on: ubuntu-latest
    steps:
    - name: PR Diff check
      uses: arghyac35/github_pr_diff_check_actions@main
      with:
        github-token: ${{github.token}}
        check: 'Test'
```

## License

This is a modification of the original template, and is released under
the MIT license.
