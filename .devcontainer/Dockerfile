# The openSUSE base image, "leap:16.0" or "tumbleweed"
FROM registry.opensuse.org/opensuse/leap:16.0

# base packages
ARG BASE_PACKAGES="bash-completion \
  command-not-found \
  curl \
  diffutils \
  findutils \
  gawk \
  git \
  glibc-locale-base \
  gpg2 \
  grep \
  gzip \
  jq \
  make \
  openssh-clients \
  patch \
  procps \
  ripgrep \
  shadow \
  ShellCheck \
  shfmt \
  sudo \
  tar \
  wdiff \
  wget \
  which \
  xz \
  yq"

# packages needed for developing your project, add your own here
ARG DEVEL_PACKAGES="npm-default chromium"

# AI code assisting related packages, the agents usually run Bash or Python code
# snippets, the AI specific packages are installed by the features referenced
# in the devcontainer.json file
ARG AI_PACKAGES="python3 python3-pip"

# Install all packages at once
RUN zypper --non-interactive --gpg-auto-import-keys install --no-recommends \
    $BASE_PACKAGES $DEVEL_PACKAGES $AI_PACKAGES \
    && zypper clean -a

# Set up a non-root user (recommended for dev containers)
ARG USERNAME=vscode
RUN useradd -s /bin/bash --uid 1000 --gid users -m $USERNAME \
    && mkdir -p /etc/sudoers.d/ \
    && echo "$USERNAME ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set the default user
USER $USERNAME
