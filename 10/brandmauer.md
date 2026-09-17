# Brandmauer
## Detecting Cordon Sanitaire Breaks in European Parliament Votes

*"Brandmauer" (literally "firewall") is the German term used for the cordon sanitaire — the informal political convention by which mainstream parties refuse to cooperate with or lend a majority to the far right.*

## The core problem: collusion is not directly observable

*"Collusion"* or *"alliance"* implies intent: a deliberate political choice by group leadership to vote together, coordinate messaging, or trade support. Roll-call data doesn't contain intent. We **only see the outcome**: who voted for, against, or abstained on a given text. Two groups can end up voting identically for entirely unrelated reasons; shared ideology on a specific issue, tactical calculation, or pure coincidence on a non-controversial file.

Because of this, we deliberately don't try to answer "did the EPP and the far right plan this together?" That question would require internal party communications, floor speeches, or coalition negotiations that aren't in the data. Instead, we ask a narrower, purely behavioral question: **on how many votes did the outcome look like a Brandmauer break, regardless of why?**

## We measure the pattern, not the direction of the alliance

A second thing the query deliberately does *not* do is attribute agency. It doesn't try to determine whether "the EPP moved toward ECR/PfE" or "ECR/PfE moved toward the EPP." Both are consistent with the same recorded outcome: they voted together. Assigning direction of movement would require a baseline of each group's "normal" position and a claim about who shifted, which is a separate (and much more interpretively loaded) analysis. Here we flag the convergence itself and let the report title/context inform interpretation case by case.

## Exclude broad-consensus votes

If we only looked for "ECR + PfE + EPP voted together," we'd catch an enormous number of votes that have nothing to do with any political realignment. A large share of European Parliament roll calls are **broad-consensus votes**: technical files, non-controversial resolutions, procedural matters, or texts where almost every group (including the far right) ends up voting yes (or no) simply because there's nothing to contest. In those cases, the EPP isn't "voting with" ECR and PfE in any meaningful political sense; everyone, including S&D and Renew, is voting the same way because the substance is likely uncontroversial. 

If we counted those, the result list would be dominated by mundane agenda items rather than genuine political fault lines, and it would say nothing about the Brandmauer.

So the query adds a condition that at least one of the two anchor centrist/pro-European groups — **S&D or Renew** — voted *differently* from the ECR–PfE–EPP bloc. This is what turns "everyone agreed" into "the EPP sided with the far right right against (part of) the traditional pro-European coalition." It's the presence of this split with S&D/Renew that gives the convergence political meaning: it isolates cases where the vote was contested enough that the pro-European center was not unanimous, and the EPP chose the ECR/PfE side of that split rather than the S&D/Renew side.

## What "breaking" means here, precisely

Put together, a row in the result represents a roll call where:

- ECR, PfE, and EPP had clear (non-null) majority positions and they matched each other, **and**
- Either S&D or Renew (or both) had a clear majority position that diverged from that ECR–PfE–EPP position.

This is a proxy for "the traditional Brandmauer alignment (center-left + center-right + liberals against the far right) did not hold, and the EPP ended up on the far right's side of a real division." It's a statistical signature of the pattern, aggregated per legislative file, not a causal or intentional claim.

## Known limitations

- **No measure of internal group cohesion.** A "majority" position with a 51/49 internal split counts identically to a unanimous one. If cohesion data is available, it may be worth weighting or flagging low-cohesion cases.
- **No magnitude of divergence.** We only know S&D or Renew's majority differed — not by how much (e.g., 90% vs. 55% of the group dissenting).
- **Null-handling asymmetry.** ECR, PfE, and EPP must have valid majorities to count; S&D and Renew only need one of the two to have a valid, divergent majority. This is intentional (either one breaking off is enough to signal disunity) but should be stated explicitly.
- **This is descriptive, not diagnostic.** The list of flagged votes is a starting point for qualitative review (reading what each report is actually about), not a finished claim about political strategy or intent.
