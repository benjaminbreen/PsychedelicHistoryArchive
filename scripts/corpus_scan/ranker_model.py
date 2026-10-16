"""Small numpy logistic-regression ranker for train_ranker.py.

Features are a PCA projection of the candidate embedding (fitted on all
embedded candidates, labelled or not) plus the score features. Targets are
soft: add = 1, maybe = 0.5, no = 0, fitted with cross-entropy and L2 weight
decay. Kept dependency-free (numpy only) and small, since the training set is
a few hundred decisions at most.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

LABEL = {"add": 1.0, "maybe": 0.5, "no": 0.0}
SCORE_FEATURES = ["relevance", "kind", "feasibility"]


@dataclass
class Model:
    mean: np.ndarray              # embedding mean, for PCA centring
    components: np.ndarray        # (k, d) PCA basis
    feat_mu: np.ndarray           # standardisation of the stacked features
    feat_sd: np.ndarray
    w: np.ndarray
    b: float
    score_features: list[str] = field(default_factory=lambda: list(SCORE_FEATURES))

    def features(self, emb: np.ndarray, scores: np.ndarray) -> np.ndarray:
        z = (emb - self.mean) @ self.components.T
        X = np.hstack([z, scores])
        return (X - self.feat_mu) / self.feat_sd

    def predict(self, emb: np.ndarray, scores: np.ndarray) -> np.ndarray:
        return sigmoid(self.features(emb, scores) @ self.w + self.b)

    def save(self, path: Path) -> None:
        np.savez(path, mean=self.mean, components=self.components, feat_mu=self.feat_mu, feat_sd=self.feat_sd,
                 w=self.w, b=np.array([self.b]), score_features=np.array(json.dumps(self.score_features)))

    @classmethod
    def load(cls, path: Path) -> "Model":
        d = np.load(path)
        return cls(d["mean"], d["components"], d["feat_mu"], d["feat_sd"], d["w"], float(d["b"][0]),
                   json.loads(str(d["score_features"])))


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(x, -30, 30)))


def pca(E: np.ndarray, k: int) -> tuple[np.ndarray, np.ndarray]:
    mean = E.mean(axis=0)
    k = max(1, min(k, E.shape[0] - 1, E.shape[1]))
    _, _, vt = np.linalg.svd(E - mean, full_matrices=False)
    return mean, vt[:k]


def fit_logreg(X: np.ndarray, y: np.ndarray, l2: float = 1.0, iters: int = 50) -> tuple[np.ndarray, float]:
    """Newton/IRLS for L2-regularised logistic regression with soft targets."""
    n, d = X.shape
    Xb = np.hstack([X, np.ones((n, 1))])
    w = np.zeros(d + 1)
    reg = np.full(d + 1, l2)
    reg[-1] = 0.0  # no penalty on the intercept
    for _ in range(iters):
        p = sigmoid(Xb @ w)
        g = Xb.T @ (p - y) + reg * w
        H = (Xb * (p * (1 - p))[:, None]).T @ Xb + np.diag(reg) + 1e-9 * np.eye(d + 1)
        step = np.linalg.solve(H, g)
        w -= step
        if np.abs(step).max() < 1e-6:
            break
    return w[:-1], float(w[-1])


def train(emb_all: np.ndarray, emb: np.ndarray, scores: np.ndarray, y: np.ndarray,
          k: int = 16, l2: float = 1.0) -> Model:
    mean, comps = pca(emb_all, k)
    z = (emb - mean) @ comps.T
    X = np.hstack([z, scores])
    mu, sd = X.mean(axis=0), X.std(axis=0) + 1e-6
    w, b = fit_logreg((X - mu) / sd, y, l2)
    return Model(mean, comps, mu, sd, w, b)


def auc(y_true: np.ndarray, p: np.ndarray) -> float | None:
    """ROC AUC for binary labels (Mann-Whitney, ties counted half)."""
    pos, neg = p[y_true == 1], p[y_true == 0]
    if not len(pos) or not len(neg):
        return None
    order = np.argsort(np.concatenate([pos, neg]), kind="mergesort")
    ranks = np.empty(len(order))
    vals = np.concatenate([pos, neg])[order]
    i = 0
    while i < len(vals):  # average ranks over ties
        j = i
        while j + 1 < len(vals) and vals[j + 1] == vals[i]:
            j += 1
        ranks[order[i : j + 1]] = (i + j) / 2 + 1
        i = j + 1
    return float((ranks[: len(pos)].sum() - len(pos) * (len(pos) + 1) / 2) / (len(pos) * len(neg)))


def cross_validate(emb_all, emb, scores, y, folds: int = 5, seed: int = 0, **kw) -> np.ndarray:
    """Out-of-fold predictions; folds are stratified by label."""
    rng = np.random.default_rng(seed)
    fold = np.zeros(len(y), dtype=int)
    for lab in np.unique(y):
        idx = np.flatnonzero(y == lab)
        rng.shuffle(idx)
        fold[idx] = np.arange(len(idx)) % folds
    oof = np.full(len(y), np.nan)
    for f in range(folds):
        tr, te = fold != f, fold == f
        if not te.any() or len(np.unique(y[tr])) < 2:
            continue
        m = train(emb_all, emb[tr], scores[tr], y[tr], **kw)
        oof[te] = m.predict(emb[te], scores[te])
    return oof
